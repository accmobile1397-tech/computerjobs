# مشخصات فنی — Phase 7: Payments · Plans · Quotas · Credits · Entitlements

**پروژه:** ComputerJobs.ir · **فاز:** 7 · **وضعیت:** ⏳ Spec — awaiting CTO review · **بدون پیاده‌سازی**

**Frozen input:** RFC-001 APPROVED WITH CONDITIONS  
→ [RFC-001-PRODUCT-RULES.md](../rfc/RFC-001-PRODUCT-RULES.md) · [RFC-001-MONETIZATION.md](../rfc/RFC-001-MONETIZATION.md)

---

## ۱. Scope

| In | Out |
|----|-----|
| PlanDefinition / PlanFeature catalog | AI provider calls (Phase 8) |
| Subscriptions (seeker + company) | Banner ad network |
| ConsumableBalance + ConsumableTransaction | Multi-resume product change |
| Quota enforcement (data-driven) | Hardcoded limit constants |
| AI credit ledger + reserve schema | MatchScore persistence |
| Checkout + PaymentProvider abstraction | International PSP |
| Admin APIs to edit plans/quotas/prices/settings | Full fiscal ERP |
| Wire publish / apply / resume-view / unlock / search to entitlements | Changing product invariants |

---

## ۲. Architecture principles (CTO)

1. **DATA-DRIVEN** — all quotas, limits, entitlements, consumables, AI credits, featured/urgent slots, apply/search/view/unlock/alert limits from DB.
2. **No business numbers in source** — only feature keys + lookups.
3. Admin Panel (API first) mutates catalog **without deploy**.
4. Honor RFC-001 **invariants** in code (not admin settings).

---

## ۳. Module

```text
src/modules/billing/          # or payments/
  services/
    entitlement.service.ts    # resolve PlanFeature limits
    wallet.service.ts         # ConsumableBalance + transactions
    subscription.service.ts
    checkout.service.ts
    quota.service.ts          # consume plan period counters
    ai-credit.service.ts      # reserve/capture/release (no AI call yet)
  providers/
    payment-provider.ts       # interface
    zarinpal.provider.ts      # stub until PSP chosen
  validators/
admin: src/app/api/v1/admin/billing/*
```

Jobs / resumes / search modules call `entitlement` / `wallet` — no local magic numbers.

---

## ۴. Data model (conceptual)

### PlanDefinition

`id`, `slug`, `audience` (SEEKER|EMPLOYER), `nameFa`, `isActive`, `sortOrder`, timestamps

### PlanFeature

`id`, `planId`, `featureKey` (string), `limitValue` (int|null=unlimited), `period` (NONE|DAY|MONTH|YEAR), `rollover` bool

### PlanPrice (SKU)

`id`, `sku`, `planId?`, `consumableType?`, `packQuantity?`, `priceIrr`, `periodMonths`, `isActive`

### Subscription

`id`, `ownerType` (USER|COMPANY), `ownerId`, `planId`, `status`, `currentPeriodStart/End`, `cancelAtPeriodEnd`

### ConsumableBalance

`id`, `ownerType`, `ownerId`, `consumableType`, `available`, `reserved`, unique(owner, type)

### ConsumableTransaction

`id`, `ownerType`, `ownerId`, `consumableType`, `delta`, `kind` (CREDIT|DEBIT|RESERVE|CAPTURE|RELEASE), `refType`, `refId`, `requestId?`, `metadata`, `createdAt`

### QuotaUsage (period counters for plan features)

`ownerType`, `ownerId`, `featureKey`, `periodKey` (e.g. `2026-07`), `used`

### SystemSetting

`key`, `valueJson`, `updatedAt`, `updatedBy`

### Payment / PaymentAttempt

gateway refs, amountIrr, status, idempotency keys

**Do not** create MatchScore table.  
**Do not** admin-toggle invariants.

---

## ۵. Feature keys (stable strings)

Examples — limits always from `PlanFeature` / settings:

`application.per_month`, `job_post.per_month`, `job.concurrent_published`, `resume_view.per_month`, `contact_unlock.per_month`, `resume_search.per_day`, `match_score.per_day`, `match_score.employer.per_day`, `company.seats`, `job.featured_slots`, `job.urgent_slots`, `saved_search.max`, `job_alert.max`, `ai_credit.included_period`

Consumable types: `job_post`, `resume_view`, `contact_unlock`, `featured_day`, `ai_credit`

---

## ۶. Runtime flows

### Entitlement check

```text
resolveSubscription(owner) → plan
getFeature(plan, key) → limit
getQuotaUsage(owner, key, period) → used
if used >= limit → try wallet consumable mapping → else QUOTA_EXCEEDED
```

### Wallet

CREDIT on purchase/admin grant · DEBIT on consume · RESERVE/CAPTURE/RELEASE for AI

### Checkout

create PaymentAttempt → redirect IPG → webhook verify → activate Subscription and/or CREDIT wallet

### Admin

CRUD PlanDefinition, PlanFeature, PlanPrice, SystemSetting; adjust ConsumableBalance (audited); no endpoint to disable invariants.

---

## ۷. Integration points (minimal)

| Existing action | Gate |
|-----------------|------|
| Job publish | `job_post` + concurrent published |
| Seeker apply | `application.per_month` |
| Resume search | `resume_search.per_day` + verified company |
| Resume full view (search) | `resume_view` |
| Contact unlock | `contact_unlock` |
| Featured / urgent | slots / `featured_day` |
| MatchScore | per_day feature (still on-demand compute) |

---

## ۸. Permissions

`billing:read:own`, `billing:checkout`, `billing:admin`, `plan:admin`, `wallet:admin`

---

## ۹. Invariants (must enforce in code)

- One resume / user · no upload · contact until unlock · verified company gates · MatchScore not stored · visibility enum unchanged

---

## ۱۰. Out of scope / debt

| ID | Item |
|----|------|
| TD-P6-2 | Search rate limiting (may use SystemSetting later) |
| TD-P5-1 | Application resume snapshot |
| PSP pick | Zarinpal vs IDPay vs NextPay at impl start |
| Phase 8 | AI gateway + capture on real calls |

---

## ۱۱. Acceptance gate

CTO APPROVE this TECHNICAL_SPEC → implementation on `main`.  
**Do not implement until APPROVE.**

---

## References

RFC-001 · D-028 Phase 7 · Phase 6 search/match · `.cto/RULEBOOK.md` · `.cto/TOKEN_OPTIMIZATION.md`
