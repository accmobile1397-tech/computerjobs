# مشخصات فنی — Phase 7: Payments · Plans · Quotas · Credits · Entitlements

**پروژه:** ComputerJobs.ir · **فاز:** 7 · **وضعیت:** ✅ Spec APPROVE WITH MINOR CONDITIONS — split 7A/7B

**Frozen input:** RFC-001 APPROVED WITH CONDITIONS

---

## ۰. Split

| Sub-phase | Scope | Status |
|-----------|--------|--------|
| **7A** | Entitlements, Quotas, Wallet, Plans, ContactUnlock, Admin catalog | **Implement now** |
| **7B** | Payment Gateway Integration (checkout, webhook, Payment*) | **Deferred** — no PSP in 7A |

---

## ۱. CTO Minor Conditions

| # | Amendment |
|---|-----------|
| 1 | `SubscriptionHistory` entity |
| 2 | `PlanFeature` versioning + effective dates |
| 3 | Money: `amount` + `currency` (not `priceIrr`-only) |
| 4 | `ContactUnlock` source of truth for unlocked contacts |
| 5 | Quota reset strategy + scheduled job ownership documented |
| 6 | Billing audit event catalog |
| 7 | Split 7A / 7B |

---

## ۲. Scope 7A

| In | Out (7B / later) |
|----|------------------|
| PlanDefinition, PlanFeature (versioned), PlanPrice (amount+currency) | IPG redirect / webhook |
| Subscription + SubscriptionHistory | Payment / PaymentAttempt runtime |
| ConsumableBalance + ConsumableTransaction | Auto-renew charge |
| QuotaUsage + reset job ownership | — |
| ContactUnlock | — |
| SystemSetting | — |
| Admin CRUD catalog + wallet grant | Checkout SKUs purchase flow |
| Gate publish / apply / unlock / view / search via entitlements | — |

---

## ۳. Money abstraction

```text
amount: Int   // minor units (IRR has no decimals → amount = rials)
currency: String  // ISO-like code, seed "IRR"
```

Never hardcode IRR amounts in TypeScript.

---

## ۴. PlanFeature versioning

Each feature row: `version`, `effectiveFrom`, `effectiveTo` (null = open).  
Resolve: active subscription plan → feature where `effectiveFrom <= now` AND (`effectiveTo` IS NULL OR `> now`) · highest `version`.

Admin “edit limit” → insert new version row (do not mutate historical row in place).

---

## ۵. Quota reset strategy

| Period | `periodKey` (Asia/Tehran via SystemSetting `billing.timezone`) |
|--------|------------------------------------------------------------------|
| DAY | `YYYY-MM-DD` |
| MONTH | `YYYY-MM` |
| YEAR | `YYYY` |
| NONE | `lifetime` |

**Reset:** counters are keyed by `periodKey` — new period ⇒ new row / zero usage (no destructive wipe required).

**Scheduled job:** `billing.ensurePeriodBoundaries`  
**Owner:** `src/modules/billing` · **Runner:** BullMQ worker (`modules/shared/queue`)  
**Cadence:** hourly (seed SystemSetting `billing.quota_job_cron`)  
**7A duty:** register job handler + compute periodKey; full worker deploy may already exist — wire processor.

Rollover: if `PlanFeature.rollover=true`, copy unused into next period as wallet CREDIT (optional 7A.1 — flag supported, impl if time).

---

## ۶. ContactUnlock

Source of truth: row `(companyId, targetUserId)` unique.  
Unlock API creates row + debits quota/wallet.  
Contact APIs check `ContactUnlock` existence — never infer from transactions alone.

---

## ۷. Billing audit catalog

| AuditAction | When |
|-------------|------|
| `PLAN_CREATED` / `PLAN_UPDATED` | Admin plan |
| `PLAN_FEATURE_VERSIONED` | New PlanFeature version |
| `PLAN_PRICE_UPDATED` | Price metadata |
| `SUBSCRIPTION_CREATED` / `CHANGED` / `CANCELED` | Lifecycle |
| `SUBSCRIPTION_HISTORY_RECORDED` | History append |
| `WALLET_CREDITED` / `WALLET_DEBITED` | Balance change |
| `AI_CREDIT_RESERVED` / `CAPTURED` / `RELEASED` | AI ledger |
| `QUOTA_CONSUMED` | Period counter++ |
| `CONTACT_UNLOCKED` | ContactUnlock create |
| `SYSTEM_SETTING_UPDATED` | Admin setting |
| `BILLING_ADMIN_GRANT` | Manual wallet/quota grant |

(7B adds `PAYMENT_*`.)

---

## ۸. Module (7A)

```text
src/modules/billing/
  services/ entitlement · quota · wallet · subscription · contact-unlock · settings · ai-credit
  jobs/ quota-period.job.ts
  validators/
```

No `providers/` PSP in 7A.

---

## ۹. Invariants

RFC-001 §A.2 — enforced in code, not SystemSetting.

---

## ۱۰. Gate

7A implementation authorized. 7B after separate CTO pass on gateway design.
