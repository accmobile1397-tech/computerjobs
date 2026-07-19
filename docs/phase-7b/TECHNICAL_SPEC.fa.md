# مشخصات فنی — Phase 7B: Payment Gateway Integration

**پروژه:** ComputerJobs.ir · **فاز:** 7B · **وضعیت:** ⏳ Spec — awaiting CTO review · **بدون پیاده‌سازی**

**Depends on:** Phase 7A closed (`v0.7-phase-7A`) — entitlements/wallet already live

---

## ۱. Scope

| In | Out |
|----|-----|
| PaymentProvider interface | Changing plan/quota engine (7A) |
| Checkout session create | AI provider calls (Phase 8) |
| IPG redirect + return URL | Banner ads |
| Webhook verify (idempotent) | Hardcoded prices |
| Activate Subscription / CREDIT wallet on success | Multi-currency FX engine |
| Payment + PaymentAttempt tables | Card data on our servers |
| PAYMENT_* audit events | — |

---

## ۲. Principles

1. Reuse 7A `PlanPrice.amount` + `currency` — no `priceIrr`-only fields.
2. On success: Subscription activate and/or `creditWallet` — never invent parallel balances.
3. Webhook + return-URL both idempotent on `gatewayRef` / `idempotencyKey`.
4. PSP chosen at impl start (Zarinpal | IDPay | NextPay) behind one interface.
5. **Diff-only** implementation when approved — load only 7B spec + billing module.

---

## ۳. Data model (7B migration)

### Payment

`id`, `ownerType`, `ownerId`, `sku`, `amount`, `currency`, `status` (PENDING|SUCCEEDED|FAILED|REFUNDED),  
`gateway`, `gatewayRef?`, `idempotencyKey` unique, `metadata` Json?, timestamps

### PaymentAttempt

`id`, `paymentId`, `status`, `rawRequest?`, `rawResponse?`, `createdAt`

---

## ۴. Flows

```text
POST /billing/checkout { sku }
  → create Payment PENDING
  → PaymentProvider.createPayment(amount, currency, callback)
  → return redirectUrl

GET  /billing/return?...   → verify → settle
POST /billing/webhook      → signature check → settle (idempotent)

settle:
  if already SUCCEEDED → no-op
  mark SUCCEEDED
  if plan SKU → Subscription + SubscriptionHistory
  if pack SKU → creditWallet(packQuantity)
  audit PAYMENT_SUCCEEDED
```

---

## ۵. Module additions

```text
src/modules/billing/
  providers/ payment-provider.ts · {psp}.provider.ts
  services/ checkout.service.ts · payment.service.ts
```

Admin: list payments (read). Refunds: admin manual 7B.1 optional.

---

## ۶. Permissions

`billing:checkout` · existing `billing:read:own` · `billing:admin`

---

## ۷. Open before coding

- [ ] Primary PSP
- [ ] Sandbox credentials process
- [ ] VAT / taxMode (SystemSetting)

---

## ۸. Gate

CTO APPROVE TECHNICAL_SPEC → implement on `main`.  
**Do not implement until APPROVE.**
