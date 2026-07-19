# Payment Security Checklist

**Phase:** 7B · **Status:** Required for production PSP go-live

## Architecture (implemented)

- [x] PaymentProvider abstraction — no PSP SDK outside `providers/`
- [x] Return URL **never** settles payment
- [x] Only verified webhook settles
- [x] Idempotent settle via `idempotencyKey` + `gatewayRef`
- [x] No card data stored on our servers

## Before production

- [ ] Replace `stub` with real PSP; set `activePaymentProvider`
- [ ] `BILLING_WEBHOOK_SECRET` / PSP signature keys in secrets manager
- [ ] HTTPS-only webhook endpoint; reject unsigned payloads
- [ ] TD-P7B-2 Webhook replay protection (timestamp + nonce)
- [ ] TD-P7B-1 Reconciliation job for stuck `PROCESSING`
- [ ] Rate-limit checkout + webhook endpoints
- [ ] Admin-only refund path; populate `refundAmount` / `refundedAt`
- [ ] Log redaction: no full raw PSP bodies in prod logs
- [ ] Sandbox → production checklist signed by CTO

## Forbidden

- Settling from browser return/callback query params alone
- Trusting client-supplied `paid=true` without provider verify
- Hardcoding amounts/currency in app code (use PlanPrice)
