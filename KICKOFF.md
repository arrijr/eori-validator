# EORI Validator Pro — Kickoff

**Status:** Planning
**Erstellt:** 2026-04-17
**Owner:** Arthur

---

## Phase 1: Markt-Validierung ✅

| Kriterium | Antwort | Status |
|---|---|---|
| Direkte Konkurrenten auf RapidAPI | Keine dedizierten EORI-APIs gefunden | ✅ |
| Popularity Score Top-Konkurrenten | N/A — Markt praktisch unbesetzt auf RapidAPI | ✅ |
| Klare Differenzierung möglich? | Ja — EU + GB in einem Endpoint, strukturierte Firmendaten | ✅ |
| Zahlungsbereitschaft bewiesen? | Ja — vatapi.com + Vatstack bieten EORI als Paid-Feature | ✅ |
| Rechtliche Risiken? | Niedrig — EU-Customs-API ist öffentlich, reine Validierung | ✅ |

**Fazit:** Kaum Konkurrenz auf RapidAPI, bewiesene Nachfrage (Post-Brexit explodiert), gleiche Zielgruppe wie VAT Validator. Klares Go.

### Differenzierungsstrategie
1. **EU + GB in einem Endpoint** — Vatstack trennt das, wir nicht
2. **Strukturierte Firmendaten** — Name + Adresse aus EU-Customs-DB wenn verfügbar
3. **Format-Validierung vor API-Call** — Spart unnötige externe Calls bei offensichtlich falschen Nummern
4. **Caching** — 24h Cache für valide Nummern (EU-Customs hat gelegentlich Downtime wie VIES)
5. **Cross-Sell** — Gleiche Zielgruppe wie VAT Validator → natürlicher Upsell

---

## Phase 2: Technischer Ansatz

| Frage | Antwort |
|---|---|
| Was tut der Core-Endpoint? | EORI-Nummer → `{ valid, eori, country, trader_name, trader_address, source }` |
| Externe Datenquelle | EU: `ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp` (SOAP/REST) — GB: HMRC Check EORI API |
| Puppeteer nötig? | **Nein** — beide sind echte APIs |
| Datenbank nötig? | **Ja** — Upstash Redis für Caching + Rate Limiting |
| Async oder synchron? | Synchron |
| Geschätzte Response-Zeit | 200–500ms (cached < 50ms) |
| Größtes technisches Risiko | **EU-Customs-Instabilität** — ähnlich wie VIES. Mitigation: 24h Cache + 503 mit `retry_after` |

### Datenquellen
- **EU EORI:** `https://ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp` — XML-Response
- **GB EORI:** HMRC API `https://api.service.hmrc.gov.uk/customs/traders/eori-checker` — REST/JSON (öffentlich, kein OAuth für einfache Checks)
- **Format-Regeln:** EU = Ländercode (2) + max 15 alphanumerische Zeichen; GB = GB + 12 Ziffern

---

## Phase 3: API-Design (Endpoints)

**3 Endpoints für v1:**

1. `POST /api/v1/validate` — Single EORI
2. `POST /api/v1/validate/batch` — Multi EORI (bis 50)
3. `GET /api/health` — Health Check

### Request / Response Schema

```json
// Request
{ "eori": "DE123456789012345" }

// Response 200 — valid
{
  "valid": true,
  "eori": "DE123456789012345",
  "country": "DE",
  "country_name": "Germany",
  "trader_name": "Example GmbH",
  "trader_address": "Musterstraße 1, 10115 Berlin, DE",
  "source": "EU_CUSTOMS",
  "cached": false,
  "verified_at": "2026-04-17T10:00:00Z"
}

// Response 200 — invalid
{
  "valid": false,
  "eori": "DE000000000000000",
  "error_code": "NOT_FOUND",
  "error": "EORI number not found in EU Customs database"
}

// Response 400
{ "error": "Invalid EORI format", "code": "INVALID_FORMAT" }
```

### Core-Regeln
- Input normalisieren: Leerzeichen entfernen, Großbuchstaben
- Format-Check vor API-Call (spart externe Requests)
- Alle Error-Responses: `{ error: string, code: string }`
- Header `X-RateLimit-Remaining` + `X-Cache: HIT|MISS` bei jedem Response
- Error-Codes: `INVALID_FORMAT`, `NOT_FOUND`, `SERVICE_UNAVAILABLE`, `COUNTRY_NOT_SUPPORTED`

---

## Phase 4: Pricing-Tiers

| Tier | Preis/Monat | Requests/Monat | Batch? | Zielgruppe |
|---|---|---|---|---|
| Free | $0 | 100 | ❌ | Testing |
| Basic | $9 | 1.000 | ✅ (max 10) | Indie-Entwickler, Freelancer |
| Pro | $29 | 10.000 | ✅ (max 50) | Import/Export-SaaS |
| Business | $99 | 100.000 | ✅ (max 50) | Zollsoftware, Compliance-Plattformen |

**Overage:** $5 pro 1.000 zusätzliche Requests

---

## Phase 5: RapidAPI Listing Vorbereitung

| Feld | Inhalt |
|---|---|
| API Name | **EORI Validator Pro** |
| Kategorie (RapidAPI) | Finance → Business / Compliance |
| Tagline (max 60 Zeichen) | "Validate EU & GB EORI numbers with trader details" (50) |
| Zielgruppe | Import/Export-SaaS, Zollsoftware, E-Commerce, Compliance-Tools |
| Hauptuse-Case | EORI-Nummer validieren + Händlername und Adresse abrufen für Customs-Compliance |
| 3 SEO-Keywords | `eori validation`, `eori number check`, `eu customs api` |
| Differenzierung | Einzige dedizierte EORI-API auf RapidAPI — EU + GB, strukturierte Firmendaten, 24h Cache |

---

## Phase 6: Infrastruktur-Checkliste

- [ ] Neues GitHub-Repo `arrijr/eori-validator` anlegen
- [ ] Vercel-Projekt konnektieren (Region: `fra1` — näher an EU-Customs-Servern)
- [ ] Upstash Redis (Caching 24h + Rate Limiting)
- [ ] Environment Variables:
  - [ ] `UPSTASH_REDIS_REST_URL`
  - [ ] `UPSTASH_REDIS_REST_TOKEN`
  - [ ] `RAPIDAPI_PROXY_SECRET`
  - [ ] `EU_CUSTOMS_ENDPOINT` (default: `https://ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp`)
  - [ ] `HMRC_EORI_ENDPOINT` (default: `https://api.service.hmrc.gov.uk/customs/traders/eori-checker`)
- [ ] Lazy Redis-Initialisierung (siehe CLAUDE.md Boilerplate)
- [ ] RapidAPI Proxy Secret Guard
- [ ] Health Check mit `eu_reachable` + `gb_reachable` Flags
- [ ] Logo: `public/logo.svg` — Kürzel `EORI`, gleiche Farben wie Portfolio

---

## Open Questions — alle beantwortet ✅

- [x] GB EORI in v1? → **Ja** — HMRC API ist öffentlich, kein OAuth nötig für einfache Checks
- [x] Cache-TTL: 24h für `valid`, 1h für `invalid` (Standard wie VAT)
- [x] Batch-Limit: max 50 (kleiner als IBAN weil externe API-Calls teurer)

---

## Nächste Schritte

1. EU-Customs EORI Endpoint testen (Spike: 2h max)
2. HMRC EORI Endpoint testen
3. Next.js Projekt scaffolden
4. `/api-review` nach erstem funktionierenden Endpoint
5. `/rapidapi-listing` wenn MVP steht
6. `/api-launch` Checkliste vor Go-Live
