# RapidAPI Listing — EORI Validator Pro

Copy-paste ready. Fields map 1:1 to RapidAPI Studio → General / Settings / Documentation.

---

## NAME
```
EORI Validator Pro
```

## CATEGORY
```
Business Software
```
(Secondary: Data)

## TAGLINE (50/60 chars)
```
Validate EU & GB EORI numbers with trader details
```

## SHORT DESCRIPTION (appears under API name in search)
```
Validate any EU or GB EORI number against the official EU Customs and HMRC databases. One endpoint covers all 27 EU member states and the United Kingdom. Returns trader name and address when disclosed. 24-hour cache keeps your app working through upstream outages. Batch endpoint validates up to 50 numbers in parallel.
```

## TAGS (10)
```
eori, eori-validation, eu-customs, hmrc, customs-api, import-export, trade-compliance, brexit, b2b, europe
```

---

## LONG DESCRIPTION

```markdown
## What is EORI Validator Pro?

**EORI Validator Pro** is the dedicated validation API for Economic Operators Registration and Identification (EORI) numbers — the identifier every business needs to clear customs in the European Union and the United Kingdom. One endpoint covers **all 27 EU member states plus the UK**, returns the trader's registered name and address when publicly disclosed, and is cached for 24 hours so your integration keeps working even when EU Customs or HMRC are having a bad day.

Post-Brexit, every cross-channel shipment requires a valid EORI on both sides. Getting it wrong means held shipments, wrong invoices, and unhappy customers. This API checks the number is real, tells you the country that issued it, and — where available — confirms who it belongs to.

## Use Cases

- **Customs Software & Freight Forwarders** — Block customers from submitting declarations with invalid EORIs before they reach the customs broker. `POST /validate` → `{ valid: true, country: "DE", trader_name: "Example GmbH" }`.
- **B2B Onboarding** — During KYB, verify the EORI a new client provides actually exists in EU Customs, not just that it follows the right format.
- **Invoicing & ERP Systems** — Auto-populate trader name and address on commercial invoices from a single EORI field. One call, everything filled in.
- **Marketplace Compliance** — Batch-check every seller's EORI overnight. Up to 50 numbers per request, results returned in input order.

## Why EORI Validator Pro?

- ✅ **EU + GB in one endpoint** — Competitors split EU and UK validation into separate products or charge extra for the UK. We don't. Pass `DE123...` or `GB123...` to the same URL — we route it to the right database.
- ✅ **Trader details when disclosed** — When a company has opted into public disclosure, we return their registered name and full address from the EU Customs database. Most validators only give you `valid: true / false`.
- ✅ **Format-check before upstream call** — Obviously malformed numbers return `INVALID_FORMAT` in under 20 ms without touching EU Customs. Saves your quota and cuts latency.
- ✅ **24-hour cache for valid numbers** — EU Customs has historically had downtime comparable to VIES. A cached `valid` response keeps your checkout and declaration flow alive through their outages.
- ✅ **Batch endpoint** — Validate up to 50 EORIs in parallel on Pro/Business. Results preserve input order, so you can zip them straight back into your rows.
- ✅ **Predictable error codes** — `INVALID_FORMAT`, `NOT_FOUND`, `COUNTRY_NOT_SUPPORTED`, `SERVICE_UNAVAILABLE`. No ambiguous strings, no null-checks on optional booleans.

## Supported Countries (28)

**EU (27):** AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK
**UK:** GB (United Kingdom)
**Also accepted:** XI (Northern Ireland — same format as EU)

## Endpoints

### Validate a single EORI

```
POST /api/v1/validate
```

**Request body:**

```json
{ "eori": "DE123456789012345" }
```

Spaces are ignored and input is auto-uppercased, so `"de 123 456 789 012 345"` hits the same cache key.

**Example Response (valid EU):**

```json
{
  "valid": true,
  "eori": "DE123456789012345",
  "country": "DE",
  "country_name": "Germany",
  "trader_name": "Example GmbH",
  "trader_address": "Musterstraße 1, 10115 Berlin, DE",
  "source": "EU_CUSTOMS",
  "cached": false,
  "verified_at": "2026-04-18T10:00:00Z"
}
```

**Example Response (invalid):**

```json
{
  "valid": false,
  "eori": "DE000000000000000",
  "error_code": "NOT_FOUND",
  "error": "EORI number not found in EU Customs database"
}
```

### Batch validate up to 50 EORIs

```
POST /api/v1/validate/batch
```

**Request body:**

```json
{ "eoris": ["DE123456789012345", "GB123456789012", "INVALID"] }
```

Returns `results` in input order plus aggregate counts. Batch size caps by plan: Basic 10, Pro / Business 50.

### Health check

```
GET /api/health
```

Returns `{ "status": "ok", "eu_reachable": true, "gb_reachable": true, "timestamp": "..." }`. Use it in your own uptime monitor.

## Quick Start

**JavaScript**
```
// Validate a single EORI
const res = await fetch('https://eori-validator-pro.p.rapidapi.com/api/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'eori-validator-pro.p.rapidapi.com'
  },
  body: JSON.stringify({ eori: 'DE123456789012345' })
});
const data = await res.json();
if (data.valid) {
  console.log(`Valid EORI from ${data.country_name}: ${data.trader_name ?? '(undisclosed)'}`);
} else {
  console.log(`Invalid: ${data.error_code}`);
}
```

**Python**
```
import requests

res = requests.post(
    'https://eori-validator-pro.p.rapidapi.com/api/v1/validate',
    headers={
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        'X-RapidAPI-Host': 'eori-validator-pro.p.rapidapi.com',
    },
    json={'eori': 'GB123456789012'},
)
data = res.json()
print(f"Valid: {data['valid']} | Source: {data.get('source')}")
```

**cURL**
```
curl -X POST "https://eori-validator-pro.p.rapidapi.com/api/v1/validate" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: eori-validator-pro.p.rapidapi.com" \
  -d '{"eori":"DE123456789012345"}'
```

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_FORMAT` | 400 | EORI does not match the expected pattern for its country |
| `COUNTRY_NOT_SUPPORTED` | 400 | 2-letter prefix is not an EU member state, XI, or GB |
| `NOT_FOUND` | 200 (valid=false) | Format is correct but the number is not registered in EU Customs or HMRC |
| `SERVICE_UNAVAILABLE` | 503 | Upstream EU Customs or HMRC temporarily unreachable — retry with backoff |
| `BATCH_LIMIT_EXCEEDED` | 422 | Batch size exceeds your plan's limit |
| `BATCH_NOT_ALLOWED` | 422 | Free plan: upgrade to Basic or higher to use the batch endpoint |
| `RATE_LIMIT_EXCEEDED` | 429 | Monthly quota for your plan exhausted |
| `FORBIDDEN` | 403 | Request did not come through the RapidAPI proxy |

## Response Headers on Every Request

- `X-RateLimit-Limit` — your plan's monthly quota
- `X-RateLimit-Remaining` — requests left in this window
- `X-Cache: HIT | MISS` — whether the result was served from the 24h cache

## About the Data

Validations are performed live against the **European Commission DG TAXUD EORI Validation Service** and **HMRC Check EORI API** — the same databases customs authorities use. Valid results are cached for 24 hours; invalid results for 1 hour. Trader name and address are only returned when the operator has opted into public disclosure — not every valid EORI will include them. See the Terms of Service for our data-accuracy and "no customs/tax advice" disclaimer.
```

---

## CODE EXAMPLE (JavaScript / Node.js)

```javascript
// Validate an EORI before submitting a customs declaration
const res = await fetch(
  'https://eori-validator-pro.p.rapidapi.com/api/v1/validate',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'eori-validator-pro.p.rapidapi.com',
    },
    body: JSON.stringify({ eori: 'DE123456789012345' }),
  }
);

const data = await res.json();

if (data.valid) {
  console.log(`${data.country_name} EORI valid — ${data.trader_name ?? 'details not disclosed'}`);
} else {
  console.error(`Rejected: ${data.error_code} — ${data.error}`);
}
```

## CODE EXAMPLE (Python — batch)

```python
import requests

res = requests.post(
    'https://eori-validator-pro.p.rapidapi.com/api/v1/validate/batch',
    headers={
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        'X-RapidAPI-Host': 'eori-validator-pro.p.rapidapi.com',
    },
    json={'eoris': ['DE123456789012345', 'GB123456789012', 'FR12345678901']},
)

data = res.json()
print(f"Checked {data['total']} — {data['valid_count']} valid, {data['invalid_count']} invalid")
for r in data['results']:
    flag = '✓' if r['valid'] else '✗'
    print(f"{flag} {r['eori']}")
```

## CODE EXAMPLE (curl)

```bash
curl -X POST "https://eori-validator-pro.p.rapidapi.com/api/v1/validate" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: eori-validator-pro.p.rapidapi.com" \
  -d '{"eori":"GB123456789012"}'
```

---

## PRICING TIERS (to enter in RapidAPI Studio → Plans)

| Tier | Price | Quota | Batch? | Hard cap? |
|---|---|---|---|---|
| **BASIC (Free)** | $0/mo | 100 req/mo | ❌ | Yes |
| **PRO** | $9/mo | 1,000 req/mo | ✅ max 10 | soft, overage $5 / 1k |
| **ULTRA** | $29/mo | 10,000 req/mo | ✅ max 50 | soft, overage $5 / 1k |
| **MEGA** | $99/mo | 100,000 req/mo | ✅ max 50 | soft, overage $5 / 1k |

**Rationale:** Live external calls to EU Customs and HMRC are the cost driver — each uncached request costs us a real upstream fetch. Free tier is intentionally thin (100/mo) because every free call still burns an EU Customs request. Overage is flat $5 / 1k across paid tiers to keep billing simple. Cache aggressively (24h for valid) to amortise the upstream cost.

**Note on RapidAPI tier naming:** RapidAPI's template names the paid tiers `PRO / ULTRA / MEGA`. The original KICKOFF.md used `Basic / Pro / Business` — same quotas, map as above.

---

## SEO KEYWORDS (for RapidAPI search ranking)

Primary: `eori validation`, `eori number check`, `eu customs api`
Secondary: `hmrc eori`, `brexit customs api`, `eori lookup`, `validate eori`
Long-tail: `eu eori validator api`, `gb eori checker api`, `eori trader name lookup`

---

## LAUNCH TODO (after publishing)

1. Copy `NAME`, `CATEGORY`, `TAGLINE`, `SHORT DESCRIPTION`, `LONG DESCRIPTION`, `TAGS` into RapidAPI Studio → General.
2. In Studio → Settings:
   - Set **Base URL** → `https://eori-validator.vercel.app`
   - Set **Transformations / Proxy Secret** → the value RapidAPI generates, then update `RAPIDAPI_PROXY_SECRET` env in Vercel (`vercel env rm` + `vercel env add`) and redeploy.
   - Set **Privacy URL** → `https://raw.githubusercontent.com/arrijr/eori-validator/main/PRIVACY.md`
   - Set **Terms URL** → `https://raw.githubusercontent.com/arrijr/eori-validator/main/TERMS.md`
   - Upload `public/logo.svg`.
3. Import `openapi.yaml` into Studio → Endpoints for auto-generated docs.
4. Configure the four plans from the table above.
5. Paste the `Quick Start` JS / Python / cURL blocks into the Documentation tab.
6. Self-test every plan with a RapidAPI test key before going public.
