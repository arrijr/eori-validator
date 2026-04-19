# RapidAPI Listing — EORI Validator Pro

Copy-paste into RapidAPI Studio. Rewritten 2026-04-19 after business-days launch learnings (SEO, no Tags field, Studio Security panel, 2-test free-plan limit).

---

## Core fields

| Field | Value |
|---|---|
| **API Name** | `EORI Validator Pro` |
| **Category** | Business Software → Logistics / Customs |
| **Base URL** | `https://eori-validator.vercel.app/api/v1` |
| **Proxy Secret** | `a859e720-3b2c-11f1-bfc1-914d8c47a51d` |
| **Health URL (monitoring)** | `https://eori-validator.vercel.app/api/health` |
| **Privacy URL** | `https://raw.githubusercontent.com/arrijr/eori-validator/main/PRIVACY.md` |
| **Terms URL** | `https://raw.githubusercontent.com/arrijr/eori-validator/main/TERMS.md` |
| **OpenAPI** | `https://raw.githubusercontent.com/arrijr/eori-validator/main/openapi.yaml` |
| **Logo** | `public/logo.svg` |

---

## Studio → Security → Secret Headers & Parameters

Add **one row** — injects the Proxy Secret on every gateway request so our middleware accepts the call:

| Name | Value | Type | Description |
|---|---|---|---|
| `X-RapidAPI-Proxy-Secret` | `a859e720-3b2c-11f1-bfc1-914d8c47a51d` | Header | Auth between RapidAPI gateway and Vercel origin |

Without this row every request returns `403 FORBIDDEN` from our middleware.

> ⚠️ **Do not put this in Transformations.** That dialog has a `Key` field expecting dotted-path format (`request.header.data`) and will reject plain header names with "Invalid format". Use the Secret Headers table above.

## Studio → Security → Transformations

**None required.** Base URL already contains `/api/v1`, so user-facing paths like `/validate` map 1:1 to origin `/api/v1/validate`. Leave the table empty.

---

## Tagline (max 60 chars)

```
Validate EU & GB EORI numbers with trader details
```
(49 chars ✓)

---

## Short description (max 160 chars)

```
Validate EU and GB EORI numbers against EU Customs and HMRC. Returns trader name + address. Single + batch (up to 50). 24h cache, stable error codes.
```
(150 chars ✓ — keywords front-loaded: "Validate", "EORI", "EU Customs", "HMRC")

---

## Long description (Overview tab)

> Paste into Studio → Settings → Description. Keywords woven in naturally — no separate Tags field exists on RapidAPI, search ranking comes from the description text + title.

```markdown
# EORI Validator Pro — EU Customs & HMRC EORI Validation API

The **EORI Validator Pro** is a dedicated REST API to validate Economic Operators Registration and Identification (EORI) numbers for the **European Union** and the **United Kingdom**. One endpoint covers all **27 EU member states plus GB and XI (Northern Ireland)**, checks the number against the official EU Customs (DG TAXUD) and HMRC databases, and returns the registered trader name and address when publicly disclosed.

Post-Brexit, every cross-channel shipment requires a valid EORI on both sides. Getting it wrong means held shipments, reshipped goods, wrong invoices, and angry customers. This API tells you — in a single call — whether an EORI is real, which country issued it, and who it belongs to.

## Why developers choose this API

- **EU + GB in one endpoint** — competitors split EU and UK into separate products or charge extra for UK. We don't. Pass `DE123...` or `GB123...` to the same URL.
- **Trader details when disclosed** — when a company has opted into public disclosure, we return their registered name and full postal address. Most validators only return `valid: true/false`.
- **Format pre-check** — obviously malformed numbers return `INVALID_FORMAT` in under 20 ms without touching upstream. Saves your quota and cuts latency on bad input.
- **24-hour cache for valid numbers** — EU Customs has historically had downtime comparable to VIES. Cached responses keep your checkout and declaration flow alive through their outages.
- **Batch endpoint** — validate up to 50 EORIs in parallel on Pro/Business. Results preserve input order, so you can zip them straight back into your spreadsheet rows.
- **Predictable error codes** — `INVALID_FORMAT`, `NOT_FOUND`, `COUNTRY_NOT_SUPPORTED`, `SERVICE_UNAVAILABLE`, `BATCH_LIMIT_EXCEEDED`, `RATE_LIMIT_EXCEEDED`. Stable, machine-readable, no ambiguous strings.
- **Generous free tier** — 100 validations / month on the BASIC plan, no credit card required.

## Common use cases

- **Customs software & freight forwarders** — block customers from submitting declarations with invalid EORIs before they reach the broker. Reduces rejection rate and customs holds.
- **B2B onboarding & KYB** — during Know-Your-Business, verify the EORI a new client provides actually exists in EU Customs, not just that it follows the right format.
- **Invoicing & ERP systems** — auto-populate trader name and address on commercial invoices from a single EORI field. One call fills the whole header.
- **Marketplace compliance** — batch-check every seller's EORI nightly. Up to 50 numbers per request, results returned in input order.
- **Logistics platforms** — validate EORI on booking intake, block non-compliant shipments before carrier assignment.
- **Tax & trade-compliance tooling** — post-Brexit compliance audits, import/export duty calculators, VAT-plus-EORI cross-checks.

## Endpoints

### `POST /validate` — validate a single EORI

Request body: `{ "eori": "DE123456789012345" }`. Spaces are ignored and input is auto-uppercased. Returns `valid` boolean, ISO country, country name, and (if disclosed) `trader_name` + `trader_address`.

### `POST /validate/batch` — validate up to 50 EORIs

Request body: `{ "eoris": ["DE123...", "GB123...", ...] }`. Returns `results` array in input order plus aggregate `valid_count` / `invalid_count`. Batch size caps by plan: PRO 10, ULTRA/MEGA 50. Not available on BASIC.

### `GET /api/health`

Returns `{ "status": "ok", "eu_reachable": true, "gb_reachable": true }`. Use it in your own uptime monitor. Unguarded — no RapidAPI key required for health checks.

## Response format

- **JSON** responses, UTF-8, `Content-Type: application/json`
- **Country codes**: ISO 3166-1 alpha-2 (uppercase, e.g. `DE`, `GB`, `XI`)
- **Timestamps**: ISO 8601 with UTC (e.g. `2026-04-19T12:00:00Z`)
- **Headers**: every response includes `X-Cache: HIT|MISS`, `X-RateLimit-Remaining`, `X-RateLimit-Limit`
- **Errors**: `{ "error": string, "error_code": string }` with stable machine-readable codes

## Supported countries (28 + XI)

**EU 27:** Austria (AT), Belgium (BE), Bulgaria (BG), Croatia (HR), Cyprus (CY), Czech Republic (CZ), Denmark (DK), Estonia (EE), Finland (FI), France (FR), Germany (DE), Greece (GR), Hungary (HU), Ireland (IE), Italy (IT), Latvia (LV), Lithuania (LT), Luxembourg (LU), Malta (MT), Netherlands (NL), Poland (PL), Portugal (PT), Romania (RO), Slovakia (SK), Slovenia (SI), Spain (ES), Sweden (SE).

**United Kingdom:** GB (Great Britain), XI (Northern Ireland — same EORI format as EU, routed to EU Customs database).

## FAQ

**Which data sources does this API use?** EU EORIs are validated against the European Commission DG TAXUD EORI Validation Service. GB EORIs are validated against the HMRC Check EORI API. These are the exact same databases that customs authorities use.

**Why doesn't every EORI return a trader name?** Trader name and address are only returned when the operator has opted into public disclosure in their country's customs registration. Many legitimate EORIs have disclosure disabled by the trader's choice — a `valid: true` without a trader_name is still a valid EORI.

**How fast is the API?** Cached responses return in under 30 ms. Uncached EU validations take 200–500 ms (EU Customs backend). Uncached GB validations take 300–700 ms (HMRC backend). Format-rejected calls return in under 20 ms without upstream fetch.

**What if EU Customs or HMRC is down?** We serve cached `valid` responses (24h TTL) during upstream outages. If the number isn't cached and upstream is down, we return HTTP 503 with `SERVICE_UNAVAILABLE` — retry with exponential backoff.

**Can I validate Northern Ireland (XI) EORIs?** Yes. XI EORIs use the EU format and are routed to the EU Customs database. Pass them like any EU code: `{ "eori": "XI123456789012" }`.

**Is there a rate limit per second?** 10 requests per second on all tiers. Monthly quota is plan-dependent (100 / 1k / 10k / 100k). When either limit hits, expect HTTP 429 with `RATE_LIMIT_EXCEEDED`.

**Is this API legally authoritative?** No. This is a convenience API for developer tooling. For binding customs declarations always use the official EU Customs or HMRC web services directly. See our Terms of Service for the full data-accuracy and "no customs/tax advice" disclaimer.

## Keywords

EORI validation, EORI number check, EU Customs API, HMRC EORI, EORI lookup API, validate EORI, EORI checker, EU EORI validator, GB EORI validator, Brexit customs API, EORI trader name lookup, EORI address lookup, EORI batch validation, import export compliance API, customs declaration API, freight forwarder API, cross-border trade API, KYB EORI verification, trade compliance API, EORI REST API.

## Disclaimer

EORI validation is performed live against EU Customs (DG TAXUD) and HMRC. Results are cached for 24h on valid responses and 1h on invalid responses. Trader name and address appear only when the operator has opted into public disclosure. For legally binding customs declarations always consult the official EU Customs or HMRC web service directly. See TERMS.md for full liability and data-accuracy terms.
```

---

## Pricing tiers (Studio → Plans)

| Tier | Price/mo | Requests/mo | Batch size | Overage |
|---|---|---|---|---|
| **BASIC (Free)** | $0 | 100 | ❌ | Hard cap |
| **PRO** | $9 | 1,000 | 10 max | $5 / 1k req |
| **ULTRA** | $29 | 10,000 | 50 max | $5 / 1k req |
| **MEGA** | $99 | 100,000 | 50 max | $5 / 1k req |

Rate limit all tiers: 10 req/sec.

**Rationale:** Every uncached validation costs us a real upstream call to EU Customs / HMRC. Free tier is thin (100/mo) because each free call still burns an upstream request. 24h cache amortises cost on paid tiers.

---

## Code examples

### cURL

```bash
curl -X POST 'https://eori-validator-pro.p.rapidapi.com/validate' \
  -H 'Content-Type: application/json' \
  -H 'x-rapidapi-host: eori-validator-pro.p.rapidapi.com' \
  -H 'x-rapidapi-key: YOUR_RAPIDAPI_KEY' \
  -d '{"eori":"DE123456789012345"}'
```

### JavaScript (fetch)

```js
const res = await fetch(
  'https://eori-validator-pro.p.rapidapi.com/validate',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'eori-validator-pro.p.rapidapi.com',
      'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
    },
    body: JSON.stringify({ eori: 'DE123456789012345' }),
  }
);
const data = await res.json();
console.log(data.valid, data.country_name, data.trader_name); // true, 'Germany', 'Example GmbH'
```

### Python (requests)

```python
import requests

r = requests.post(
    "https://eori-validator-pro.p.rapidapi.com/validate",
    headers={
        "Content-Type": "application/json",
        "x-rapidapi-host": "eori-validator-pro.p.rapidapi.com",
        "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
    },
    json={"eori": "GB123456789012"},
)
data = r.json()
print(data["valid"], data.get("country_name"), data.get("trader_name"))
```

### Python (batch)

```python
import requests

r = requests.post(
    "https://eori-validator-pro.p.rapidapi.com/validate/batch",
    headers={
        "Content-Type": "application/json",
        "x-rapidapi-host": "eori-validator-pro.p.rapidapi.com",
        "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
    },
    json={"eoris": ["DE123456789012345", "GB123456789012", "FR12345678901"]},
)
data = r.json()
print(f"{data['valid_count']} valid / {data['invalid_count']} invalid")
for item in data["results"]:
    print(("✓" if item["valid"] else "✗"), item["eori"])
```

---

## Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_FORMAT` | 400 | EORI does not match the expected pattern |
| `COUNTRY_NOT_SUPPORTED` | 400 | 2-letter prefix is not EU, XI, or GB |
| `NOT_FOUND` | 200 (`valid:false`) | Format correct but not registered |
| `SERVICE_UNAVAILABLE` | 503 | Upstream EU Customs / HMRC unreachable |
| `BATCH_LIMIT_EXCEEDED` | 422 | Batch size exceeds plan limit |
| `BATCH_NOT_ALLOWED` | 422 | Free plan — upgrade for batch |
| `RATE_LIMIT_EXCEEDED` | 429 | Monthly quota or per-second limit hit |
| `FORBIDDEN` | 403 | Direct request bypassing RapidAPI gateway |

---

## Studio Tests (free plan: 2 max)

> RapidAPI Studio free tier allows only 2 active tests per API. The two below are mandatory. Additional tests (happy EU + happy GB) only if the plan is upgraded.

### Test 1: Health (every 15 min)

| Field | Value |
|---|---|
| Name | `Health` |
| Location | Frankfurt |
| Step 1 | HTTP GET |
| URL | `https://eori-validator.vercel.app/api/health` |
| Variable | `health` |
| Headers | *(none — health is unguarded)* |
| Step 2 | Assert Equals |
| Expression | `health.data.status` |
| Value | `ok` |
| Schedule | every 15 min |

### Test 2: Format rejection (every 60 min)

Deterministic — tests guard + middleware + format-validation logic with no upstream dependency.

| Field | Value |
|---|---|
| Name | `Format-Reject` |
| Location | Frankfurt |
| Step 1 | HTTP POST |
| URL | `https://eori-validator.vercel.app/api/v1/validate` |
| Variable | `fmt` |
| Headers | `X-RapidAPI-Proxy-Secret: a859e720-3b2c-11f1-bfc1-914d8c47a51d`<br>`Content-Type: application/json` |
| Body (JSON) | `{"eori":"BAD"}` |
| Step 2 | Assert Equals |
| Expression | `fmt.data.error_code` |
| Value | `INVALID_FORMAT` |
| Schedule | every 60 min |

**Why this test and not a live EU/GB validation?** An upstream EU-Customs downtime would falsely fail a live happy-path test. A format-rejection test is deterministic and still exercises: (1) middleware guard with injected Proxy Secret, (2) body parsing, (3) format-validation logic, (4) stable error-code contract.

**Studio assertion syntax reminder:** Expression field is entered **without `{{ }}` braces**. Body of the response lives under `<var>.data.<field>`, not `<var>.body.<field>`. `<var>.status` is the HTTP status code, not a body field.

---

## Go-Live Checklist

- [x] GitHub repo: `arrijr/eori-validator`
- [x] Vercel deployed: `https://eori-validator.vercel.app` (fra1, SSO off)
- [x] Env vars set (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RAPIDAPI_PROXY_SECRET`)
- [x] Proxy Secret Guard in middleware
- [x] README, PRIVACY, TERMS, openapi.yaml, logo.svg on `main`
- [x] API published on RapidAPI
- [x] 1 Studio test scheduled (Health — already active)
- [ ] **New listing description** — paste updated Long description above into Studio → Description (replaces old one)
- [ ] **New short description** — paste 150-char version above (replaces old 300-char one)
- [ ] **Second Studio test** — add Format-Reject per spec above (currently only 1/2 free-plan tests used)
- [ ] Secret Headers table verified: `X-RapidAPI-Proxy-Secret` row present
- [ ] Transformations table empty
- [ ] Playground smoketest: call `POST /validate` with real EORI via RapidAPI test key → 200 JSON
