# RFC-001 — Monetization

**Status:** ☑ **APPROVED WITH CONDITIONS** (CTO 2026-07-19)  
**ID:** RFC-001-B  
**Companion:** [RFC-001-PRODUCT-RULES.md](./RFC-001-PRODUCT-RULES.md)  
**Freeze:** Commercial model frozen for Phase 7 design  
**Currency MVP:** IRR integer (no decimals)

---

## CTO Conditions (binding)

Same as Product Rules: **data-driven** entitlements & prices; **no hardcoded business numbers**; entities `PlanDefinition`, `PlanFeature`, `ConsumableBalance`, `ConsumableTransaction`, `SystemSetting` (or equivalent); Admin Panel edits without deploy; invariants unchanged.

---

## A. Amendment — Configurable vs Invariant

### Configurable (Admin / DB)

- PlanDefinition, PlanFeature (quotas, included credits)
- SKU / price metadata (IRR amounts, pack sizes, period)
- ConsumableBalance + ConsumableTransaction (runtime)
- SystemSetting (grace days, taxMode, pack TTL, featured-per-page, …)
- AI credit grant amounts on subscribe

### Invariant

- Contact hidden until unlock  
- Verified company for employer paid actions  
- Match score not persisted  
- Single resume / no upload / visibility enum model  
- Provider abstraction (no card data on our servers)

### Prices in §2

**Seed catalog only** — admin may change `priceIrr` without release.

---

## 1. Commercial Model

Subscription + consumption packs + à-la-carte. Free tiers always on.

---

## 2. Seed list prices (IRR) — editable via Admin

| SKU | Period | Seed price IRR |
|-----|--------|----------------|
| `seeker_pro_m` | month | 490,000 |
| `seeker_pro_y` | year | 4,900,000 |
| `employer_starter_m` | month | 2,900,000 |
| `employer_starter_y` | year | 29,000,000 |
| `employer_growth_m` | month | 7,900,000 |
| `employer_growth_y` | year | 79,000,000 |
| `employer_enterprise` | custom | custom |
| `pack_unlock_10` | — | 990,000 |
| `pack_unlock_50` | — | 3,900,000 |
| `pack_view_50` | — | 490,000 |
| `pack_view_200` | — | 1,490,000 |
| `pack_ai_100` | — | 390,000 |
| `pack_ai_500` | — | 1,490,000 |
| `pack_featured_7` | — | 790,000 |
| `unit_unlock` / `unit_view` / `unit_ai` / `unit_featured_day` | — | 120k / 15k / 5k / 150k |

---

## 3. Phase 7 target entities

| Entity | Role |
|--------|------|
| `PlanDefinition` | Catalog plan |
| `PlanFeature` | featureKey → limit/amount per plan |
| `PlanPrice` / SKU | pricing metadata |
| `Subscription` | owner binding |
| `ConsumableBalance` | wallet per owner + type |
| `ConsumableTransaction` | ledger (credit/debit/reserve/capture/release) |
| `SystemSetting` | global knobs |
| `Payment` / `PaymentAttempt` | PSP |

Debit order: plan period quota → wallet → reject `QUOTA_EXCEEDED`.

AI: RESERVE → CAPTURE | RELEASE (Phase 8 runtime; schema OK in Phase 7).

---

## 4. Payment gateway assumptions

`PaymentProvider` interface; Iran IPG redirect; no PCI card storage; webhook idempotent.  
**Primary PSP:** CTO pick at Phase 7 implementation start (Zarinpal / IDPay / NextPay).  
VAT `taxMode` → SystemSetting (`none` until finance confirms).

---

## 5. Phase mapping

| Phase | Work |
|-------|------|
| **7** | Plans, quotas, wallets, checkout, metering, admin config APIs |
| **8** | AI reserve/capture on gateway |
| Later | Banner ad network, intl PSP |

---

## Sign-off

- [x] CTO — **APPROVE WITH CONDITIONS** (2026-07-19)  
- Supersedes draft [payments.md](./payments.md) for Phase 7 planning  
- **No coding** until Phase 7 TECHNICAL_SPEC APPROVE
