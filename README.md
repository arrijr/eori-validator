# EORI Validator Pro

Validate EU & GB EORI numbers against the official EU Customs and HMRC registries. Returns structured trader details when available.

- 🇪🇺 All 27 EU member states (EU Customs DDS2)
- 🇬🇧 United Kingdom (HMRC EORI Checker)
- 🏢 Trader name & address when consent to disclosure given
- ⚡ Smart caching (24h for valid results, 1h for invalid)
- 📦 Batch validation (tier-based limits)

Published on [RapidAPI](https://rapidapi.com).

---

## Stack

- Next.js 16 (App Router)
- Vercel (serverless, region `fra1`)
- Upstash Redis (cache + rate limiting)
- EU Customs SOAP + HMRC REST

## Development

```bash
npm install
cp .env.example .env.local
# fill in Upstash credentials
npm run dev
```

Test with a known-valid EORI:

```bash
curl -X POST http://localhost:3000/api/v1/validate \
  -H "Content-Type: application/json" \
  -d '{"eori": "IE6388047V"}'
```

## Endpoints

- `POST /api/v1/validate` — single EORI validation
- `POST /api/v1/validate/batch` — batch validation (tier-based)
- `GET /api/health` — service health (EU + GB reachability)

Full spec: [openapi.yaml](./openapi.yaml)

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Yes in prod | In-memory fallback locally |
| `UPSTASH_REDIS_REST_TOKEN` | Yes in prod | |
| `RAPIDAPI_PROXY_SECRET` | Yes in prod | Rejects direct calls with 403 |

## Access

API is only accessible through RapidAPI. Direct requests are rejected with `403 FORBIDDEN`. Subscribe at [RapidAPI](https://rapidapi.com) to get a key.

## Legal

- [Privacy Policy](./PRIVACY.md)
- [Terms of Service](./TERMS.md)

Not customs, tax or legal advice. Validation reflects registry state at query time.

## Deploy

```bash
vercel --prod
```
