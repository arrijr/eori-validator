import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheGet, cacheSet } from "@/lib/redis";
import { validateEori, normalizeEori, validateEoriFormat } from "@/lib/eori";
import { errorJson, rateLimitedResponse, withRateHeaders } from "@/lib/responses";
import type { EoriResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TTL = 86400;
const INVALID_TTL = 3600;

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req.headers);
  if (!rl.success) return rateLimitedResponse(rl);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, "Invalid JSON body", "INVALID_JSON", rl);
  }

  const raw = (body as { eori?: unknown } | null)?.eori;
  if (typeof raw !== "string" || raw.length === 0) {
    return errorJson(400, "Missing 'eori' field", "INVALID_FORMAT", rl);
  }

  const eori = normalizeEori(raw);
  const fmt = validateEoriFormat(eori);
  if (!fmt.valid) {
    const code =
      fmt.country && fmt.country !== "GB" && fmt.error?.includes("not supported")
        ? "COUNTRY_NOT_SUPPORTED"
        : "INVALID_FORMAT";
    return errorJson(400, fmt.error || "Invalid EORI format", code, rl, "MISS");
  }

  const cacheKey = `eori:${eori}`;
  const cached = await cacheGet<EoriResult>(cacheKey);
  if (cached) {
    const payload: EoriResult = cached.valid
      ? { ...cached, cached: true }
      : cached;
    const res = NextResponse.json(payload, { status: 200 });
    return withRateHeaders(res, rl, "HIT");
  }

  const result = await validateEori(eori);

  if ("error_code" in result && result.error_code === "SERVICE_UNAVAILABLE") {
    const res = NextResponse.json(result, { status: 503 });
    return withRateHeaders(res, rl, "MISS");
  }

  const ttl = result.valid ? VALID_TTL : INVALID_TTL;
  await cacheSet(cacheKey, result, ttl);

  const res = NextResponse.json(result, { status: 200 });
  return withRateHeaders(res, rl, "MISS");
}
