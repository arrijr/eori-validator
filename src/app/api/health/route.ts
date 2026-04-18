import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EU_ENDPOINT =
  process.env.EU_CUSTOMS_ENDPOINT ||
  "https://ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp";
const HMRC_ENDPOINT =
  process.env.HMRC_EORI_ENDPOINT ||
  "https://api.service.hmrc.gov.uk/customs/traders/eori-checker";

const PING_TIMEOUT = 3000;

async function ping(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT);
  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    return res.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const [eu, gb] = await Promise.all([ping(EU_ENDPOINT), ping(HMRC_ENDPOINT)]);
  return NextResponse.json({
    status: "ok",
    eu_reachable: eu,
    gb_reachable: gb,
    timestamp: new Date().toISOString(),
  });
}
