# RFC-001 — Product Rules

**Status:** ☑ **APPROVED WITH CONDITIONS** (CTO 2026-07-19)  
**ID:** RFC-001-A  
**Companion:** [RFC-001-MONETIZATION.md](./RFC-001-MONETIZATION.md)  
**Freeze:** Product rules frozen for Phase 7 design  
**Scope:** Product behavior — **no application code in this RFC**

---

## CTO Conditions (binding)

1. All quotas, limits, plan entitlements, consumables, AI credits, featured/urgent slots, application/search/view/unlock/alert limits are **DATA-DRIVEN**.
2. **No business numbers** may be hardcoded in application source code.
3. Phase 7 must include configurable entities (or equivalent): `PlanDefinition`, `PlanFeature`, `ConsumableBalance`, `ConsumableTransaction`, `SystemSetting`.
4. Admin Panel can change plan limits, quotas, AI credits, consumable amounts, pricing metadata **without code deployment**.
5. Product **invariants** (§A.2) are **not** admin-configurable.
6. This amendment (§A) documents configurable vs invariant rules.

---

## A. Amendment — Configurable vs Invariant

### A.1 Admin-configurable (DB / Admin Panel)

| Category | Examples (keys / rows — seed defaults only) |
|----------|-----------------------------------------------|
| Plan catalog | plan slug, name, period, active flag, sort |
| Plan entitlements | applications/month, job posts/month, concurrent published jobs, resume views, unlocks, search/day, match/day, seats, featured slots, urgent slots, alerts, saved searches, included AI credits |
| Pricing metadata | SKU price IRR, currency, display name, pack sizes |
| Consumable catalog | unlock, resume_view, ai_credit, featured_day, job_post unit definitions |
| System settings | quota reset timezone, view-credit window days, pack default TTL, featured-per-page cap, grace days, AI reserve TTL, rate-limit thresholds (when wired) |
| Rollover flags | per-plan / per-feature `rollover` boolean |

**Seed values** in RFC tables below are **initial catalog data**, not compile-time constants.

### A.2 Product invariants (code + policy — NOT admin-editable)

| Invariant |
|-----------|
| Single active resume per user |
| No resume file uploads |
| Contact data hidden until unlock |
| Verified + ACTIVE company required for employer premium actions (search/unlock/publish gate as defined) |
| Match score is computed on demand — **not persisted** |
| Resume visibility model: PRIVATE · EMPLOYERS_ONLY · PUBLIC |

### A.3 Engineering rule

```text
entitlementService.getLimit(owner, featureKey) → number from PlanFeature | SystemSetting
wallet.getBalance(owner, consumableKey) → ConsumableBalance
// NEVER: if (apps > 30) in source
```

---

## 0. Principles

1. Free tier remains useful for core seeker + light employer flows.
2. Monetization gates premium actions, not public job listing reads.
3. Contact data never exposed without Unlock (invariant).
4. Limits server-enforced; UI advisory.
5. Quota period / timezone via `SystemSetting` (seed: Asia/Tehran).
6. Numeric tables = **seed defaults** editable by admin after go-live.

---

## 1. Job Seeker Limits (seed defaults)

| Feature key | Free seed | Seeker Pro seed |
|-------------|-----------|-----------------|
| `resume.active_max` | 1 | 1 (invariant: max remains 1 until product changes RFC) |
| `application.per_month` | 30 | 100 |
| `saved_search.max` | 3 | 20 |
| `job_alert.max` | 3 | 20 |
| `match_score.per_day` | 50 | 200 |
| `ai_credit.included_period` | 0 | 50 |

Note: `resume.active_max` value **must stay 1** while invariant holds — admin UI should refuse values ≠ 1 or hide the field.

**Behavioral rules (invariant / logic):** apply without resume OK; ACTIVE resume only on attach; banned users blocked; seekers cannot unlock contacts.

---

## 2. Employer Limits (seed defaults)

Gate: company membership + VERIFIED + ACTIVE (invariant).

| Feature key | Free | Starter | Growth | Enterprise |
|-------------|------|---------|--------|------------|
| `job.concurrent_published` | 1 | 5 | 20 | custom row |
| `job_post.per_month` | 1 | 10 | 40 | custom |
| `resume_search.per_day` | 20 | 100 | 500 | custom |
| `resume_view.per_month` | 20 | 150 | 500 | custom |
| `contact_unlock.per_month` | 0 | 30 | 150 | custom |
| `job.featured_slots` | 0 | 1 | 5 | custom |
| `job.urgent_slots` | 0 | 3 | 15 | custom |
| `company.seats` | 2 | 5 | 15 | custom |
| `match_score.employer.per_day` | 50 | 200 | 1000 | custom |

**Logic (not numeric):** drafts unlimited; publish consumes `job_post`; pause/close no refund; republish window days → `SystemSetting`; unverified = drafts only; suspended = blocked.

---

## 3–4. Resume Viewing & Contact Unlock

Visibility matrix and unlock semantics: **invariant**.  
View window days, teaser skill count, whether application-context view is free: **SystemSetting / PlanFeature** where numeric.

Contact unlock: permanent per company↔user; audit required; no contact in public JSON — **invariant**.

---

## 5–8. Plans, Consumption, AI Credits, Ads

Plan IDs (`seeker_free`, `employer_starter`, …) are catalog rows.  
Consumable keys and AI reserve/capture flow: see Monetization RFC.  
Featured-per-page and denylist: `SystemSetting` / admin config.  
No ads on private resume surfaces — **invariant**.

---

## 9. Anti-Abuse

Thresholds (velocity, parallel AI reserves) → `SystemSetting`.  
Ladder warn→throttle→suspend→ban → product logic (invariant process).

---

## Sign-off

- [x] CTO — **APPROVE WITH CONDITIONS** (2026-07-19)  
- Conditions applied in §CTO + §A  
- Phase 7 TECHNICAL_SPEC may be generated  
- **No implementation** until Phase 7 spec CTO APPROVE
