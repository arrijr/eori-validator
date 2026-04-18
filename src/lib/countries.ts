export const EU_COUNTRIES: Record<string, string> = {
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  HR: "Croatia",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  GR: "Greece",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  LV: "Latvia",
  LT: "Lithuania",
  LU: "Luxembourg",
  MT: "Malta",
  NL: "Netherlands",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SK: "Slovakia",
  SI: "Slovenia",
  ES: "Spain",
  SE: "Sweden",
  XI: "Northern Ireland",
};

export const GB_COUNTRY = { GB: "United Kingdom" };

export function countryName(code: string): string | undefined {
  if (code === "GB") return GB_COUNTRY.GB;
  return EU_COUNTRIES[code];
}

export function isEuCountry(code: string): boolean {
  return code in EU_COUNTRIES;
}
