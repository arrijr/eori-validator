# Terms of Service — EORI Validator Pro

**Last updated:** 2026-04-18
**Provider:** Arthur Richelhof (arrijr)
**Contact:** richelhofarthur@gmail.com

---

## 1. Acceptance

By subscribing to or using the EORI Validator Pro API ("the Service") via RapidAPI, you agree to these Terms. If you do not agree, do not use the Service.

## 2. Service description

The Service validates Economic Operators Registration and Identification (EORI) numbers issued by the European Union member states and the United Kingdom. It returns validity status and, where made publicly available by the upstream authority, the registered trader name and address. Validation results are cached for up to 24 hours for valid responses and 1 hour for invalid responses.

## 3. No customs, tax, or legal advice

**Results are provided for informational purposes only and do not constitute customs, tax, legal, or compliance advice.** You are solely responsible for verifying EORI status with the issuing customs authority before filing customs declarations, clearing shipments, issuing invoices, or making any commercial decision. The Service is not a substitute for consulting a licensed customs broker, tax professional, or legal counsel.

## 4. Data accuracy and upstream dependencies

EORI data is retrieved from official government endpoints (European Commission DG TAXUD for EU numbers, HMRC for GB numbers). These upstream systems have historically experienced downtime, rate limiting, and data inconsistencies. No representation is made that data is current or correct at every moment. The `verified_at` and `cached` fields in each response indicate when a result was last fetched from the upstream source. A `valid: true` result means the EORI was recognised by the upstream database at the time of verification — it does not imply the trader is in good standing, not sanctioned, or authorised to conduct a specific transaction.

## 5. Not a sanctions, AML, or KYC check

The Service is **not** a sanctions screening, anti-money-laundering, or know-your-customer tool. You must not rely on it for sanctions clearance, beneficial-ownership verification, or any regulated compliance obligation. Use a dedicated, licensed provider for those purposes.

## 6. Acceptable use

You agree not to:
- Reverse-engineer, scrape, or attempt to access the Service outside the RapidAPI gateway.
- Resell, redistribute, or republish the underlying dataset as a competing service.
- Use the Service to harass, profile, or discriminate against economic operators.
- Use the Service for any unlawful purpose.
- Exceed published rate limits or circumvent authentication.

Violation may result in immediate termination without refund.

## 7. Service availability

We target high availability but make no uptime guarantees beyond those in your RapidAPI subscription plan. Planned maintenance, force majeure, or — in particular — unavailability of the upstream EU Customs or HMRC endpoints may cause interruptions. During upstream outages the Service may return cached results or `503 SERVICE_UNAVAILABLE`.

## 8. Disclaimer of warranties

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT.

## 9. Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE PROVIDER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE — EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. AGGREGATE LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.

## 10. Indemnification

You agree to indemnify and hold harmless the provider from any claim arising out of your use of the Service, including claims related to customs declarations, clearance delays, fines, invoices issued, or shipments released based on data retrieved.

## 11. Termination

Either party may terminate at any time via RapidAPI's cancellation flow. These Terms survive termination with respect to sections 3, 5, 8, 9, and 10.

## 12. Governing law

These Terms are governed by the laws of Germany. Disputes shall be resolved in the courts of Germany.

## 13. Changes

We may update these Terms. Continued use after an update constitutes acceptance.

## Contact

Arthur Richelhof — richelhofarthur@gmail.com
