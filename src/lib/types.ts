export type EoriSource = "EU_CUSTOMS" | "HMRC";

export type EoriErrorCode =
  | "INVALID_FORMAT"
  | "NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "COUNTRY_NOT_SUPPORTED";

export interface ValidEoriResponse {
  valid: true;
  eori: string;
  country: string;
  country_name: string;
  trader_name: string | null;
  trader_address: string | null;
  source: EoriSource;
  cached: boolean;
  verified_at: string;
}

export interface InvalidEoriResponse {
  valid: false;
  eori: string;
  error_code: EoriErrorCode;
  error: string;
}

export type EoriResult = ValidEoriResponse | InvalidEoriResponse;

export type Tier = "free" | "basic" | "pro" | "business";

export const TIER_BATCH_LIMITS: Record<Tier, number> = {
  free: 0,
  basic: 10,
  pro: 50,
  business: 50,
};

export const TIER_MONTHLY_LIMITS: Record<Tier, number> = {
  free: 100,
  basic: 1000,
  pro: 10000,
  business: 100000,
};
