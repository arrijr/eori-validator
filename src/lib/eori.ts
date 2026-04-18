import { countryName, isEuCountry } from "./countries";
import type { InvalidEoriResponse, ValidEoriResponse } from "./types";

const EU_ENDPOINT =
  process.env.EU_CUSTOMS_ENDPOINT ||
  "https://ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp";
const HMRC_ENDPOINT =
  process.env.HMRC_EORI_ENDPOINT ||
  "https://api.service.hmrc.gov.uk/customs/traders/eori-checker";

const EXTERNAL_TIMEOUT_MS = 5000;

export function normalizeEori(eori: string): string {
  return (eori || "").replace(/\s+/g, "").toUpperCase();
}

export function validateEoriFormat(eori: string): {
  valid: boolean;
  country?: string;
  error?: string;
} {
  if (!eori || eori.length < 3) {
    return { valid: false, error: "EORI too short" };
  }
  const country = eori.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(country)) {
    return { valid: false, error: "EORI must start with 2-letter country code" };
  }
  const body = eori.slice(2);
  if (country === "GB") {
    if (!/^\d{12}$/.test(body)) {
      return { valid: false, country, error: "GB EORI must be 'GB' + 12 digits" };
    }
    return { valid: true, country };
  }
  if (!isEuCountry(country)) {
    return { valid: false, country, error: `Country ${country} not supported` };
  }
  if (!/^[A-Z0-9]{1,15}$/.test(body)) {
    return {
      valid: false,
      country,
      error: "EU EORI body must be 1–15 alphanumeric chars",
    };
  }
  return { valid: true, country };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = EXTERNAL_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildValid(
  eori: string,
  country: string,
  source: "EU_CUSTOMS" | "HMRC",
  traderName: string | null,
  traderAddress: string | null,
): ValidEoriResponse {
  return {
    valid: true,
    eori,
    country,
    country_name: countryName(country) || country,
    trader_name: traderName,
    trader_address: traderAddress,
    source,
    cached: false,
    verified_at: new Date().toISOString(),
  };
}

function buildInvalid(
  eori: string,
  code: InvalidEoriResponse["error_code"],
  message: string,
): InvalidEoriResponse {
  return { valid: false, eori, error_code: code, error: message };
}

function parseEuSoapResponse(xml: string, eori: string, country: string):
  | ValidEoriResponse
  | InvalidEoriResponse {
  const statusMatch = xml.match(/<statusDescr[^>]*>([^<]*)<\/statusDescr>/i);
  const statusCodeMatch = xml.match(/<status[^>]*>([^<]*)<\/status>/i);
  const nameMatch = xml.match(/<name[^>]*>([^<]*)<\/name>/i);
  const streetMatch = xml.match(/<street[^>]*>([^<]*)<\/street>/i);
  const postMatch = xml.match(/<postalCode[^>]*>([^<]*)<\/postalCode>/i);
  const cityMatch = xml.match(/<city[^>]*>([^<]*)<\/city>/i);
  const countryMatch = xml.match(/<country[^>]*>([^<]*)<\/country>/i);

  const status = (statusCodeMatch?.[1] || statusMatch?.[1] || "").trim().toLowerCase();
  const isInvalid =
    status.includes("invalid") ||
    status.includes("not found") ||
    status.includes("unknown") ||
    status === "1";

  if (isInvalid) {
    return buildInvalid(eori, "NOT_FOUND", "EORI number not found in EU Customs database");
  }

  const parts = [
    streetMatch?.[1]?.trim(),
    [postMatch?.[1]?.trim(), cityMatch?.[1]?.trim()].filter(Boolean).join(" "),
    countryMatch?.[1]?.trim(),
  ].filter((p) => p && p.length > 0);
  const address = parts.length > 0 ? parts.join(", ") : null;
  const name = nameMatch?.[1]?.trim() || null;

  return buildValid(eori, country, "EU_CUSTOMS", name, address);
}

export async function checkEuCustoms(
  eori: string,
): Promise<ValidEoriResponse | InvalidEoriResponse> {
  const country = eori.slice(0, 2);
  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:eos="http://eos.dgtaxud.ec/">
  <soapenv:Header/>
  <soapenv:Body>
    <eos:validateEORI>
      <eos:eori>${eori}</eos:eori>
    </eos:validateEORI>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const res = await fetchWithTimeout(EU_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Accept: "text/xml",
        SOAPAction: "",
      },
      body: soapBody,
    });
    if (!res.ok) {
      return buildInvalid(eori, "SERVICE_UNAVAILABLE", `EU Customs returned ${res.status}`);
    }
    const text = await res.text();
    return parseEuSoapResponse(text, eori, country);
  } catch {
    return buildInvalid(eori, "SERVICE_UNAVAILABLE", "EU Customs service unavailable");
  }
}

export async function checkHmrc(
  eori: string,
): Promise<ValidEoriResponse | InvalidEoriResponse> {
  try {
    const url = `${HMRC_ENDPOINT}/${encodeURIComponent(eori)}`;
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Accept: "application/vnd.hmrc.1.0+json" },
    });
    if (res.status === 404) {
      return buildInvalid(eori, "NOT_FOUND", "EORI number not found in HMRC database");
    }
    if (!res.ok) {
      return buildInvalid(eori, "SERVICE_UNAVAILABLE", `HMRC returned ${res.status}`);
    }
    const data = (await res.json()) as {
      eori?: string;
      valid?: boolean;
      traderName?: string;
      name?: string;
      address?:
        | string
        | {
            streetAndNumber?: string;
            postCode?: string;
            city?: string;
            country?: string;
          };
    };
    if (data.valid === false) {
      return buildInvalid(eori, "NOT_FOUND", "EORI number not found in HMRC database");
    }
    const name = data.traderName || data.name || null;
    let address: string | null = null;
    if (typeof data.address === "string") {
      address = data.address;
    } else if (data.address) {
      const parts = [
        data.address.streetAndNumber,
        [data.address.postCode, data.address.city].filter(Boolean).join(" "),
        data.address.country,
      ].filter((p) => p && p.length > 0);
      address = parts.length > 0 ? parts.join(", ") : null;
    }
    return buildValid(eori, "GB", "HMRC", name, address);
  } catch {
    return buildInvalid(eori, "SERVICE_UNAVAILABLE", "HMRC service unavailable");
  }
}

export async function validateEori(
  rawEori: string,
): Promise<ValidEoriResponse | InvalidEoriResponse> {
  const eori = normalizeEori(rawEori);
  const fmt = validateEoriFormat(eori);
  if (!fmt.valid) {
    const code = fmt.country && !isEuCountry(fmt.country) && fmt.country !== "GB"
      ? "COUNTRY_NOT_SUPPORTED"
      : "INVALID_FORMAT";
    return buildInvalid(eori, code, fmt.error || "Invalid EORI format");
  }
  if (fmt.country === "GB") {
    return checkHmrc(eori);
  }
  return checkEuCustoms(eori);
}
