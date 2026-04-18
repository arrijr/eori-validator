import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { cacheGet, cacheSet } from "@/lib/redis";
import { validateEori, normalizeEori } from "@/lib/eori";
import { errorJson, rateLimitedResponse, withRateHeaders } from "@/lib/responses";
import { TIER_BATCH_LIMITS, type EoriResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HARD_MAX = 50;
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

  const eoris = (body as { eoris?: unknown } | null)?.eoris;
  if (!Array.isArray(eoris) || eoris.length === 0) {
    return errorJson(400, "'eoris' must be a non-empty array", "INVALID_FORMAT", rl);
  }
  if (eoris.some((e) => typeof e !== "string")) {
    return errorJson(400, "All entries in 'eoris' must be strings", "INVALID_FORMAT", rl);
  }
  if (eoris.length > HARD_MAX) {
    return errorJson(400, `Batch size ${eoris.length} exceeds hard limit of ${HARD_MAX}`, "BATCH_LIMIT_EXCEEDED", rl);
  }

  const tierLimit = TIER_BATCH_LIMITS[rl.tier];
  if (tierLimit === 0) {
    return errorJson(
      422,
      "Batch endpoint is not available on the Free tier. Upgrade to Basic or higher.",
      "BATCH_NOT_ALLOWED",
      rl,
    );
  }
  if (eoris.length > tierLimit) {
    return errorJson(
      422,
      `Batch size ${eoris.length} exceeds your plan limit of ${tierLimit}.`,
      "BATCH_LIMIT_EXCEEDED",
      rl,
    );
  }

  const results = await Promise.all(
    (eoris as string[]).map(async (raw) => {
      const eori = normalizeEori(raw);
      const cacheKey = `eori:${eori}`;
      const cached = await cacheGet<EoriResult>(cacheKey);
      if (cached) {
        return cached.valid ? { ...cached, cached: true } : cached;
      }
      const settled = await Promise.allSettled([validateEori(eori)]);
      const r = settled[0];
      if (r.status === "rejected") {
        return {
          valid: false as const,
          eori,
          error_code: "SERVICE_UNAVAILABLE" as const,
          error: "Validation failed",
        };
      }
      const result = r.value;
      if (!("error_code" in result) || result.error_code !== "SERVICE_UNAVAILABLE") {
        const ttl = result.valid ? VALID_TTL : INVALID_TTL;
        await cacheSet(cacheKey, result, ttl);
      }
      return result;
    }),
  );

  const valid_count = results.filter((r) => r.valid).length;
  const invalid_count = results.length - valid_count;

  const res = NextResponse.json(
    { results, total: results.length, valid_count, invalid_count },
    { status: 200 },
  );
  return withRateHeaders(res, rl);
}
