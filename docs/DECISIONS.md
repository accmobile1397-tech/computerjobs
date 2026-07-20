# Decision Log — ComputerJobs.ir

Chronological record of significant decisions. For detailed rationale see `docs/adr/`.

| Date | ID | Decision | Status |
|------|-----|----------|--------|
| 2026-07-18 | D-001 | Master prompt v1.0 — phased delivery, spec-first | Active |
| 2026-07-19 | D-002 | Deployment: OpenShip VPS only (not Vercel hybrid) | Active → ADR-0004 |
| 2026-07-19 | D-003 | Prisma 6 + MySQL 8 | Active → ADR-0002 |
| 2026-07-19 | D-004 | CTO Rulebook + per-phase CTO_REPORT review | Active |
| 2026-07-19 | D-005 | **Phase 0 Approved** with conditions (see below) | Active |
| 2026-07-19 | D-006 | Feature-first `src/modules/` from Phase 1 — no deferral | Active → ADR-0001 |
| 2026-07-19 | D-007 | AI module subfolders (gateway, providers, …) from skeleton | Active → ADR-0003 |
| 2026-07-19 | D-008 | Taxonomy subfolders + Location subfolders from skeleton | Active |
| 2026-07-19 | D-009 | Git workflow: direct commits on `main` only | Active (supersedes develop/feature) |
| 2026-07-19 | D-010 | Rulebook split into `.cto/*.md` specialized files | Active |
| 2026-07-19 | D-011 | ADR + RFC process from Phase 0 closeout | Active |
| 2026-07-19 | D-012 | Phase 1 renamed: **Identity & Access Management (IAM)** | Active |
| 2026-07-19 | D-013 | `docs/SECURITY_DECISIONS.md` — security decision log | Active |
| 2026-07-19 | D-014 | `docs/SEO_STRATEGY.md` — URL map from day one | Active |
| 2026-07-19 | D-015 | ADR-0005 taxonomy module structure | Active |
| 2026-07-19 | D-016 | **Architecture Guardian** role + `docs/reviews/ARCHITECTURE_GUARDIAN.md` | Active |
| 2026-07-19 | D-017 | `users/` module separate from `auth/` (Phase 1 IAM) | Active |
| 2026-07-19 | D-018 | **Phase 0 final:** CTO APPROVE WITH CONDITIONS — all conditions met | **Closed** |
| 2026-07-19 | D-019 | Phase 0 Closed — enter Phase 1 IAM | Active |
| 2026-07-19 | D-020 | Phase 1 IAM spec — CTO approved for implementation | **Closed** |
| 2026-07-19 | D-021 | Phase 1 IAM implemented | **Closed** |
| 2026-07-19 | D-026 | **Phase 1 CLOSED** — APPROVE WITH CONDITIONS · tag `v0.2-phase-1` | **Closed** |
| 2026-07-19 | D-027 | Phase 2 spec — **APPROVE** · implementation authorized | **Closed** |
| 2026-07-19 | D-028 | **Product roadmap** Phases 2–8 (CTO-approved order) | **Superseded by D-046** |
| 2026-07-19 | D-046 | **Post-Phase-8 Roadmap** Phases 9–15 · SoT until v1.0 | Active |
| 2026-07-20 | D-047 | RFC-003 Event Architecture — **CLOSED** (C-003-1/2) | **Closed** |
| 2026-07-20 | D-048 | RFC-004 Notification Architecture — **CLOSED** | **Closed** |
| 2026-07-20 | D-049 | RFC-005 Admin Platform — **CLOSED** (C-005-1/2) | **Closed** |
| 2026-07-20 | D-050 | Phase 9 spec — **APPROVE WITH CONDITIONS** · implementation AUTHORIZED | Active |
| 2026-07-20 | TD-NOTIF-2 | Notification Digest Engine | Active (P2) |
| 2026-07-20 | D-051 | **Core architecture stack complete** (through Events/Notifications/Admin RFCs) | Active |
| 2026-07-20 | TD-EVT-1 | Central Event Registry | Active (P2) |
| 2026-07-20 | TD-NOTIF-1 | Webhook notification channel | Active (P2) |
| 2026-07-20 | TD-ADMIN-1 | Feature Flag Engine | Active (P2) |
| 2026-07-19 | TD-P2-1 | HTTP Integration Tests | Active (P1) |
| 2026-07-19 | TD-P6-1 | Advanced Search Engine | Active (P2) |
| 2026-07-19 | D-029 | **Phase 2 CLOSED** — APPROVE WITH CONDITIONS · tag `v0.3-phase-2` | **Closed** |
| 2026-07-19 | D-030 | Phase 3 spec — **APPROVE** · implementation authorized | **Closed** |
| 2026-07-19 | D-031 | **Phase 3 CLOSED** — APPROVE · tag `v0.4-phase-3` | **Closed** |
| 2026-07-19 | D-032 | Phase 4 spec — **APPROVE WITH MINOR CONDITIONS** | **Closed** |
| 2026-07-19 | D-033 | **Phase 4 CLOSED** — APPROVE · tag `v0.5-phase-4` | **Closed** |
| 2026-07-19 | D-034 | Phase 5 spec — **APPROVE WITH MINOR CONDITIONS** | **Closed** |
| 2026-07-19 | D-035 | **Phase 5 CLOSED** — APPROVE · tag `v0.6-phase-5` | **Closed** |
| 2026-07-19 | D-036 | Phase 6 spec — **APPROVE WITH CONDITIONS** | **Closed** |
| 2026-07-19 | D-037 | Phase 6 implementation — **awaiting CTO review** | Active |
| 2026-07-19 | D-038 | RFC-001 — **APPROVE WITH CONDITIONS** · frozen for Phase 7 | **Closed** |
| 2026-07-19 | D-039 | Phase 7 spec — **APPROVE WITH MINOR CONDITIONS** · 7A/7B split | **Closed** |
| 2026-07-19 | D-040 | **Phase 7A CLOSED** — APPROVE WITH CONDITIONS · `v0.7-phase-7A` | **Closed** |
| 2026-07-19 | D-041 | Phase 7B spec — **APPROVE WITH MINOR CONDITIONS** | **Closed** |
| 2026-07-19 | D-042 | Phase 7B implementation — Payment Gateway | **Closed** |
| 2026-07-19 | D-043 | **Phase 7B CLOSED** — APPROVE WITH CONDITIONS · `v0.8-phase-7B` | **Closed** |
| 2026-07-19 | D-044 | RFC-002 AI Architecture — **CLOSED** · tag `v0.8-ai-rfc` | **Closed** |
| 2026-07-19 | D-045 | **Phase 8 CLOSED** — APPROVE · tag `v0.9-phase-8` | **Closed** |
| 2026-07-19 | TD-P8-1 | Local (Ollama) AI provider adapter | Active (P2) |
| 2026-07-19 | TD-P7B-1 | Payment Reconciliation Job | Active (P1) |
| 2026-07-19 | TD-P7B-2 | Webhook Replay Protection | Active (P1) |
| 2026-07-19 | TD-P7B-3 | Multi PSP Failover | Active (P2) |
| 2026-07-19 | TD-P7A-1 | Entitlement Cache Layer | Active (P2) |
| 2026-07-19 | TD-P7A-2 | Usage Analytics | Active (P2) |
| 2026-07-19 | TD-P7A-3 | Feature Flag Framework | Active (P2) |
| 2026-07-19 | TD-P7A-4 | AI Credit Reservation Stress Testing | Active (P1) |
| 2026-07-19 | TD-P6-2 | Search Rate Limiting | Active (P1) |
| 2026-07-19 | TD-P5-1 | Application Resume Snapshot | Active (P1) |
| 2026-07-19 | D-022 | **CTO handoff:** commit link on `main` | Active |
| 2026-07-19 | D-023 | No feature branches | **Superseded by D-024** |
| 2026-07-19 | D-024 | **Direct commits on `main`** — no develop branch | Active |
| 2026-07-19 | D-025 | **`develop` branch deleted** from local + remote | Active |

---

## D-051: Core Architecture Stack Complete

**Decision:** CTO (2026-07-20) — through Phase 8 + RFC-003/004/005, no new RFC required for main capabilities until after Phase 10.  
**Stack:** IAM · Companies · Jobs · Resume · Search · Billing · Payments · AI · Events · Notifications · Admin (architectures frozen).

**Phase order (confirmed):** 9 Notifications → 10 Admin → 11 SEO → 12 SSR → 13 Analytics & Events → 14 Recommendations → 15 Advanced AI

---

## D-050: Phase 9 Spec — APPROVE WITH CONDITIONS · AUTHORIZED

**Decision:** ☑ **APPROVE WITH CONDITIONS** (CTO 2026-07-20)  
**Conditions:** C-009-1 correlationId · C-009-2 NotificationPriority · C-009-3 channel matrix · C-009-4 mapping version  
**Document:** [docs/phase-9/CTO_SPEC_APPROVAL.md](./phase-9/CTO_SPEC_APPROVAL.md)  
**Plan:** [docs/phase-9/IMPLEMENTATION_PLAN.md](./phase-9/IMPLEMENTATION_PLAN.md)  
**Requires:** RFC-003/004/005 ✅ FROZEN

---


## D-049: RFC-005 Admin Platform — CLOSED

**Decision:** ☑ **APPROVE WITH CONDITIONS** → **FROZEN / CLOSED** (CTO 2026-07-20)  
**Document:** [docs/rfc/RFC-005-ADMIN-PLATFORM-ARCHITECTURE.md](./rfc/RFC-005-ADMIN-PLATFORM-ARCHITECTURE.md)

**Conditions:** C-005-1 Admin UI → Admin API → domain only · C-005-2 TD-ADMIN-1 Feature Flag Engine reserved

---

## D-048: RFC-004 Notification Architecture — CLOSED

**Decision:** ☑ **APPROVE** → **FROZEN / CLOSED** (CTO 2026-07-20)  
**Document:** [docs/rfc/RFC-004-NOTIFICATION-ARCHITECTURE.md](./rfc/RFC-004-NOTIFICATION-ARCHITECTURE.md)

**Note:** WEBHOOK channel reserved (TD-NOTIF-1)

---

## D-047: RFC-003 Event Architecture — CLOSED

**Decision:** ☑ **APPROVE WITH CONDITIONS** → **FROZEN / CLOSED** (CTO 2026-07-20)  
**Document:** [docs/rfc/RFC-003-EVENT-ARCHITECTURE.md](./rfc/RFC-003-EVENT-ARCHITECTURE.md)

**Conditions:** C-003-1 mandatory version bump on schema change · C-003-2 TD-EVT-1 Event Registry reserved

---

## D-046: Post-Phase-8 Roadmap (SoT until v1.0)

**Decision:** CTO roadmap after Phase 8 close — platform usable; next work is architecture RFCs then Phases 9–15.  
**Document:** [docs/ROADMAP.md](./ROADMAP.md)

**Before Phase 9:** RFC-003 · RFC-004 · RFC-005 APPROVE/FROZE  
**Phases 9–15:** Notifications → Admin → SEO → Public SSR → Analytics → Recommendations → Advanced AI

**Carryover:** Phase 6 formal close/tag · Phase 8.1 Resume AI Suggest

---

## D-028: Product Roadmap (Phases 2–8) — Superseded

**Status:** **Superseded by D-046** — Phases 2–8 complete (Phase 6 formal tag pending).

| Phase | Scope |
|-------|--------|
| 2 | User Profiles & Company Management |
| 3 | Location · Taxonomy · Skills · Technologies |
| 4 | Jobs |
| 5 | Resume Builder |
| 6 | Search & Matching |
| 7 | Payments & Plans |
| 8 | AI Layer |

Dependency note: Jobs (4) after Taxonomy + Location (3).

---

## D-045: Phase 8 Closed

**Decision:** ☑ **APPROVE** (CTO 2026-07-19)  
**Tag:** `v0.9-phase-8`  
**Approval:** [docs/phase-8/CTO_IMPLEMENTATION_APPROVAL.md](./phase-8/CTO_IMPLEMENTATION_APPROVAL.md)  
**Implementation:** [`855d230..63c6288`](https://github.com/accmobile1397-tech/computerjobs/compare/855d230^...63c6288)  
**Prerequisite:** RFC-002 CLOSED · `v0.8-ai-rfc` (D-044)

**Debt:** TD-P8-1 Local provider · TD-P7A-4 carry

---

## D-044: RFC-002 AI Architecture — CLOSED

**Decision:** ☑ **APPROVE WITH CONDITIONS** → **FROZEN** → **CLOSED** (CTO 2026-07-19)  
**Tag:** `v0.8-ai-rfc`  
**Document:** [docs/rfc/RFC-002-AI-ARCHITECTURE.md](./rfc/RFC-002-AI-ARCHITECTURE.md)

**Frozen conditions:**

1. Provider-agnostic — only `modules/ai/gateway` may call provider SDKs  
2. Cost protection — mandatory `estimateCost()` → 402 `AI_CREDIT_REQUIRED` if over  
3. Prompt registry — files under `prompts/`; no inline prompts  
4. Safety — mandatory `moderate()` before provider call; contract `complete`/`embed`/`moderate`  
5. Provider health — `ai.providerHealthWindow` + reserved `AiProviderHealth`  
6. Model routing — `ai.modelRouting` JSON by `featureKey` (replaces `ai.defaultModel`)

> Note: CTO message referenced “D-034 Close RFC-002”; D-034 remains Phase 5. RFC-002 close is **D-044**.

---

## D-043: Phase 7B Closed

**Decision:** ☑ **APPROVE WITH CONDITIONS** (CTO 2026-07-19)  
**Tag:** `v0.8-phase-7B` · **Approval:** [docs/phase-7b/CTO_IMPLEMENTATION_APPROVAL.md](./phase-7b/CTO_IMPLEMENTATION_APPROVAL.md)  
**Audit model:** [docs/billing/BILLING_AUDIT_MODEL.md](./billing/BILLING_AUDIT_MODEL.md)  
**Security:** [docs/security/PAYMENT_SECURITY_CHECKLIST.md](./security/PAYMENT_SECURITY_CHECKLIST.md)  
**Debt:** TD-P7B-1 Reconciliation · TD-P7B-2 Replay · TD-P7B-3 Multi-PSP failover

---

## D-042: Phase 7B Implementation

**Decision:** Implementation on `main` — Payment Gateway  
**Status:** **Closed** — see D-043  
**Conditions:** full PaymentStatus lifecycle · PaymentProvider-only · PAYMENT_SETTLED · idempotent settle · refund fields · return URL no settle · `activePaymentProvider`  
**Record:** [docs/phase-7b/CTO_REPORT.md](./phase-7b/CTO_REPORT.md)

---

## D-041: Phase 7B Spec — APPROVE WITH MINOR CONDITIONS

**Decision:** ☑ **APPROVE WITH MINOR CONDITIONS** (CTO 2026-07-19)  
**Status:** **Closed** — see D-042  
**Document:** [docs/phase-7b/TECHNICAL_SPEC.fa.md](./phase-7b/TECHNICAL_SPEC.fa.md)

---

## D-040: Phase 7A Closed

**Decision:** ☑ **APPROVE WITH CONDITIONS** (CTO 2026-07-19)  
**Tag:** `v0.7-phase-7A` · **Implementation:** [`f160270..bed1704`](https://github.com/accmobile1397-tech/computerjobs/compare/f160270...bed1704)  
**Record:** [docs/phase-7/CTO_IMPLEMENTATION_APPROVAL.md](./phase-7/CTO_IMPLEMENTATION_APPROVAL.md)  
**Audit catalog:** [docs/phase-7/AUDIT_EVENT_CATALOG.md](./phase-7/AUDIT_EVENT_CATALOG.md)

**Debt:** TD-P7A-1…4 · ContactUnlock unique `(companyId, targetUserId)` verified

---

## D-039: Phase 7 Spec — APPROVE WITH MINOR CONDITIONS

**Decision:** ☑ **APPROVE WITH MINOR CONDITIONS** (CTO 2026-07-19)  
**Status:** **Closed** — 7A implementing · 7B deferred  
**Amendments:** SubscriptionHistory · PlanFeature versioning · amount+currency · ContactUnlock · quota job ownership · billing audit catalog · 7A/7B split  
**Docs:** TECHNICAL_SPEC · DATABASE_DESIGN · CTO_SPEC_APPROVAL

---

## D-038: RFC-001 Product Rules & Monetization — APPROVED

**Decision:** ☑ **APPROVE WITH CONDITIONS** (CTO 2026-07-19)  
**Status:** **Closed** — product rules **frozen** for Phase 7  
**Documents:**
- [docs/rfc/RFC-001-PRODUCT-RULES.md](./rfc/RFC-001-PRODUCT-RULES.md)
- [docs/rfc/RFC-001-MONETIZATION.md](./rfc/RFC-001-MONETIZATION.md)

**Conditions:** data-driven quotas/prices; no hardcoded business numbers; PlanDefinition/PlanFeature/ConsumableBalance/ConsumableTransaction/SystemSetting; Admin Panel without deploy; invariants non-configurable (§A).

---

## D-037: Phase 6 Implementation

**Decision:** Implementation complete — **awaiting CTO review**  
**Tag (after APPROVE):** `v0.7-phase-6`  
**Record:** [docs/phase-6/CTO_REPORT.md](./phase-6/CTO_REPORT.md)

**Debt:** TD-P6-2 Search Rate Limiting (P1)

---

## D-036: Phase 6 Spec — APPROVE WITH CONDITIONS

**Decision:** ☑ **APPROVE WITH CONDITIONS** (CTO 2026-07-19)  
**Status:** **Closed** — see D-037  
**Record:** [docs/phase-6/CTO_SPEC_APPROVAL.md](./phase-6/CTO_SPEC_APPROVAL.md)

---

## D-035: Phase 5 Closed

**Decision:** ☑ **APPROVE** (CTO 2026-07-19)  
**Tag:** `v0.6-phase-5` · **Implementation:** [`cf68aa5..fe0df57`](https://github.com/accmobile1397-tech/computerjobs/compare/cf68aa5...fe0df57)  
**Record:** [docs/phase-5/CTO_IMPLEMENTATION_APPROVAL.md](./phase-5/CTO_IMPLEMENTATION_APPROVAL.md)

**Technical debt (accepted/carried):** TD-P5-1, TD-P2-1

---

## D-034: Phase 5 Spec — APPROVE WITH MINOR CONDITIONS

**Decision:** ☑ **APPROVE WITH MINOR CONDITIONS** (CTO 2026-07-19)  
**Status:** **Closed** — see D-035  
**Record:** [docs/phase-5/CTO_SPEC_APPROVAL.md](./phase-5/CTO_SPEC_APPROVAL.md)

---

## D-033: Phase 4 Closed

**Decision:** ☑ **APPROVE** (CTO 2026-07-19)  
**Tag:** `v0.5-phase-4` · **Implementation:** [`a1378ed..23342ba`](https://github.com/accmobile1397-tech/computerjobs/compare/a1378ed...23342ba)  
**Record:** [docs/phase-4/CTO_IMPLEMENTATION_APPROVAL.md](./phase-4/CTO_IMPLEMENTATION_APPROVAL.md)

**Technical debt (accepted):** TD-P2-1, TD-P3-1, TD-P4-1

---

## D-032: Phase 4 Spec — APPROVE WITH MINOR CONDITIONS

**Decision:** ☑ **APPROVE WITH MINOR CONDITIONS** (CTO 2026-07-19)  
**Status:** **Closed** — implementation complete, see D-033  
**Record:** [docs/phase-4/CTO_SPEC_APPROVAL.md](./phase-4/CTO_SPEC_APPROVAL.md)

**Minor conditions:** PENDING_REVIEW, VIEWED, SalaryType, experienceLevel filter, reserved nullable fields.

---

## D-031: Phase 3 Closed

**Decision:** ☑ **APPROVE** (CTO 2026-07-19)  
**Tag:** `v0.4-phase-3` · **Implementation:** [`a4f9677..ff4c6da`](https://github.com/accmobile1397-tech/computerjobs/compare/a4f9677...ff4c6da)  
**Record:** [docs/phase-3/CTO_IMPLEMENTATION_APPROVAL.md](./phase-3/CTO_IMPLEMENTATION_APPROVAL.md)

**Technical debt (accepted):** TD-P2-1, TD-P3-1, TD-P2-2

---

## D-030: Phase 3 Spec — APPROVE

**Decision:** ☑ **APPROVE** (CTO 2026-07-19)  
**Status:** **Closed** — implementation complete, see D-031  
**Record:** [docs/phase-3/CTO_SPEC_APPROVAL.md](./phase-3/CTO_SPEC_APPROVAL.md)

**Enhancements applied:** aliases, popularityScore, officialUrl, isOfficial, Employer source, JSON seed files.

---

## D-029: Phase 2 Closed

**Decision:** ☑ **APPROVE WITH CONDITIONS** (CTO 2026-07-19)

**Conditions (non-blocking):**
1. API integration tests — before end of Phase 3
2. Audit event coverage verification — before end of Phase 3
3. Rate limiting (Invite + public slug APIs) — future phase
4. Public profile/company SEO metadata — future phases

**Tag:** `v0.3-phase-2` · **Implementation:** `847fe54..fe7bc85`  
**Record:** [docs/phase-2/CTO_IMPLEMENTATION_APPROVAL.md](./phase-2/CTO_IMPLEMENTATION_APPROVAL.md)

**Technical debt (accepted):** TD-P2-1, TD-P2-2

---

## D-027: Phase 2 Spec — APPROVE

**Decision:** ☑ **APPROVE** (CTO 2026-07-19) — no blockers  
**Status:** **Closed** — see D-029  
**Record:** [docs/phase-2/CTO_SPEC_APPROVAL.md](./phase-2/CTO_SPEC_APPROVAL.md)

**Implementation guidelines (non-blocking):** completionScore computed; stable slugs; soft delete; invite hash; public API fields only; avoid God Module in `users/`.

---

## D-026: Phase 1 Closed

**Decision:** APPROVE WITH CONDITIONS (2026-07-19)

**Conditions:**
1. Shared module migration continues in future phases
2. Taxonomy skeleton remains planned
3. Location skeleton remains planned

**Tag:** `v0.2-phase-1` · **Implementation:** `769b6de`

---

## D-021: Phase 1 IAM Implementation (Closed)

Delivered on `main`. Formal closure D-026.

---

## D-024: Direct Commits on `main`

All phase work commits directly to `main`. CTO receives commit link only.  
`develop` branch **deleted** 2026-07-19 (local + `origin/develop`).

---

## D-025: Delete `develop` Branch

Removed `origin/develop` and local `develop`. Single branch workflow: `main` only.

---

## D-023: No Feature Branches (Superseded)

Was: work on `develop`. Superseded by D-024 (2026-07-19).

---

## D-022: CTO Handoff Workflow

Official delivery: **commit link** on `main` (+ optional `CTO_REPORT.md`).

See [docs/reviews/CTO_HANDOFF.md](./reviews/CTO_HANDOFF.md).

---

## D-021: Phase 1 IAM Implementation (Closed)

_(see D-026 above)_

---

## D-020: Phase 1 IAM Spec (Closed)

Documents in `docs/phase-1/`:
- TECHNICAL_SPEC.fa.md, DATABASE_DESIGN.md, API_DESIGN.md (+ supporting docs)
- RBAC table-driven; User types: JOB_SEEKER, EMPLOYER, ADMIN, SUPER_ADMIN
- JWT access + refresh; 2FA schema only; no OAuth Phase 1

**Gate:** CTO approval of TECHNICAL_SPEC + DATABASE + API → implementation on `feature/auth`

CTO rating: **9.5/10** — APPROVE WITH CONDITIONS.

All conditions verified:

1. ✅ `src/modules/` + `modules/shared/` (env, logger, prisma, redis, queue, storage, config)
2. ✅ AI / taxonomy / location skeletons
3. ✅ `develop` branch
4. ✅ `docs/adr/` (0001–0005), `docs/rfc/`, `docs/DECISIONS.md`
5. ✅ Split Rulebook (`.cto/*.md`)
6. ✅ `docs/SECURITY_DECISIONS.md`
7. ✅ `docs/SEO_STRATEGY.md`
8. ✅ Architecture Guardian review

**Authorized to proceed:** Phase 1 IAM spec

CTO approved Phase 0 with these conditions — **implemented in commit following approval**:

1. ✅ Create `src/modules/` structure from Phase 1 start  
2. ✅ Migrate `src/lib/` → `modules/shared/`  
3. ✅ Create `develop` branch  
4. ✅ Add `docs/adr/` and `docs/rfc/`  
5. ✅ Skeleton modules: ai, taxonomy, location (with subfolders)  
6. ✅ Split Rulebook into specialized `.cto/` files  

---

## How to Add a Decision

1. Create ADR in `docs/adr/` if architectural  
2. Add row to this table  
3. Reference in phase `CTO_REPORT.md` if phase-related  
