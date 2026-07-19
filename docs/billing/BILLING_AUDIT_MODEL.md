# Billing Audit Model

**Phase:** 7A + 7B · **Related:** [../phase-7/AUDIT_EVENT_CATALOG.md](../phase-7/AUDIT_EVENT_CATALOG.md)

## Principles

1. Every money-affecting and entitlement-affecting action writes `AuditLog` with `AuditAction`.
2. Payment settlement emits **both** `PAYMENT_SETTLED` (idempotent marker) and `PAYMENT_SUCCEEDED` (business success).
3. Wallet and subscription changes remain separate events (`WALLET_*`, `SUBSCRIPTION_*`).
4. Metadata must include correlation ids: `paymentId`, `gatewayRef`, `idempotencyKey`, `txId` when applicable.
5. No PII (card numbers, full webhook secrets) in metadata.

## Ownership

| Domain | Writer |
|--------|--------|
| Plans / features / settings | Admin billing APIs |
| Quotas / wallet | `quota.service` / `wallet.service` |
| Contact unlock | `contact-unlock.service` |
| Payments | `payment.service` (checkout + webhook settle only) |

## Debt

- TD-P7B-1 Payment Reconciliation Job — catch PROCESSING stuck vs PSP  
- TD-P7B-2 Webhook Replay Protection — nonce/TTL beyond idempotent status  
- TD-P7A-2 Usage Analytics — aggregate from audit + ledger
