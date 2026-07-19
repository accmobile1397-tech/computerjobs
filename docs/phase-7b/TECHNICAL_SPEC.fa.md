# مشخصات فنی — Phase 7B: Payment Gateway Integration

**پروژه:** ComputerJobs.ir · **فاز:** 7B · **وضعیت:** ✅ Spec APPROVE WITH MINOR CONDITIONS — implementation authorized

**Depends on:** 7A (`v0.7-phase-7A`)

---

## CTO Minor Conditions

| # | Amendment |
|---|-----------|
| 1 | Payment status: PENDING · PROCESSING · SUCCEEDED · FAILED · CANCELLED · REFUNDED |
| 2 | PaymentProvider abstraction only — no PSP imports outside `providers/` |
| 3 | Audit `PAYMENT_SETTLED` (+ PAYMENT_CREATED / FAILED / REFUNDED as needed) |
| 4 | Settlement idempotent on `idempotencyKey` + `gatewayRef` |
| 5 | Reserved: `refundAmount`, `refundedAt` |
| 6 | **Return URL never settles** — only verified webhook settles |
| 7 | SystemSetting `activePaymentProvider` |

---

## Scope

Checkout · Provider interface · Webhook settle · Subscription/wallet credit on success  

**Out:** AI · changing 7A quota engine · card storage · FX

---

## Flows

```text
POST /billing/checkout { sku, idempotencyKey? }
  → Payment PENDING → provider.create → PROCESSING + gatewayRef
  → { redirectUrl, paymentId }

GET  /billing/return?paymentId=…   → read-only status (NO settle)

POST /billing/webhook
  → provider.verifySignature + verifyPayment
  → settlePayment (idempotent)
      if SUCCEEDED/REFUNDED already → no-op
      else SUCCEEDED → grant plan/pack → PAYMENT_SETTLED + PAYMENT_SUCCEEDED
```

---

## Data

Payment: ownerType/Id, sku, amount, currency, status, gateway, gatewayRef?, idempotencyKey unique,  
refundAmount?, refundedAt?, metadata?, timestamps  

PaymentAttempt: paymentId, status, rawRequest?, rawResponse?

---

## Provider

`getActivePaymentProvider()` reads SystemSetting `activePaymentProvider` (seed: `stub`).  
Implementations only under `src/modules/billing/providers/`.
