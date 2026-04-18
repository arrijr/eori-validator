# Privacy Policy — EORI Validator Pro

**Last updated:** 2026-04-18
**Provider:** Arthur Richelhof (arrijr)
**Contact:** richelhofarthur@gmail.com

---

## What data we collect

This API validates EU and GB EORI numbers against official customs databases. We collect **the minimum data required to operate the service**:

| Data | Purpose | Retention |
|---|---|---|
| IP address | Rate limiting (sliding window) | 30 days (rolling window only) |
| RapidAPI user identifier (`x-rapidapi-user` header) | Rate limiting per subscription | 30 days (rolling window only) |
| RapidAPI proxy secret header | Authentication | Not stored |
| Submitted EORI number | Validation + short-term caching | 24 h (valid) / 1 h (invalid) |
| Trader name and address (returned by EU Customs / HMRC) | Caching of upstream response | 24 h |

We do **not** collect, log, or persist:
- Full request bodies or response bodies beyond the cache entry above
- Any personally identifiable information beyond what official customs databases make publicly available
- Cookies or tracking identifiers
- Any data beyond the retention windows listed above

## How we process data

- Cache and rate-limiting state are stored in **Upstash Redis** (EU region, `fra1`) with automatic expiry.
- Infrastructure is hosted on **Vercel** (EU region, `fra1`) and **Upstash** (EU).
- No data leaves the European Union.
- No analytics, no tracking pixels, no third-party scripts.

## Data sources

Validation data is retrieved from publicly accessible government endpoints:
- **EU EORI:** European Commission — DG TAXUD EORI Validation Service
- **GB EORI:** HM Revenue & Customs (HMRC) Check EORI API

We do not modify, enrich, or combine this data with any other source.

## Legal basis (GDPR)

- **Rate limiting (IP / user ID):** legitimate interest (Art. 6(1)(f) GDPR) — protecting the service from abuse.
- **Caching of EORI lookups:** legitimate interest (Art. 6(1)(f) GDPR) — ensuring availability when upstream customs databases are temporarily unreachable, and reducing load on public infrastructure.

Trader names and addresses cached by the Service are already published by the European Commission and HMRC as public records of economic operators.

## Your rights

Because data is purged automatically within the retention windows listed above and is not linked to a natural person beyond what is already public, rights of access, rectification, erasure, and portability are limited. If you believe a specific cache entry should be purged, contact us at richelhofarthur@gmail.com and we will clear it within 72 hours.

## Subprocessors

- **RapidAPI (RapidAPI Inc., USA)** — API gateway; see RapidAPI's own privacy policy.
- **Vercel Inc. (USA, EU region)** — hosting.
- **Upstash Inc. (EU region)** — cache and rate-limiting storage.
- **European Commission — DG TAXUD** — upstream EU EORI data source.
- **HM Revenue & Customs (UK)** — upstream GB EORI data source.

## Changes

Material changes will be reflected in this document and the `Last updated` date.

## Contact

Arthur Richelhof — richelhofarthur@gmail.com
