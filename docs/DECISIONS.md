# Decision Log — ComputerJobs.ir

Chronological record of significant decisions. For detailed rationale see `docs/adr/`.

| Date | ID | Decision | Status |
|------|-----|----------|--------|
| 2026-07-21 | D-066 | **Phase 12 TECHNICAL_SPEC** — APPROVE WITH CONDITIONS (C-012-1..10) · P12-001 authorized | Active |
| 2026-07-21 | D-065 | **Phase 11 CLOSED** — APPROVE CLOSE · tag `v0.12-phase-11` | **Closed** |
| 2026-07-21 | D-064 | **P11-008 APPROVED** · P11-009 authorized | Active |
| 2026-07-21 | D-063 | **P11-007 APPROVED** · P11-008 authorized | Active |
| 2026-07-21 | D-062 | **P11-006 APPROVED** · P11-007 authorized | Active |
| 2026-07-21 | D-061 | **P11-005 APPROVED** · P11-006 authorized | Active |
| 2026-07-21 | D-060 | **P11-004 APPROVED** · P11-005 authorized | Active |
| 2026-07-21 | D-059 | **P11-003 APPROVED** · P11-004 authorized | Active |
| 2026-07-21 | D-058 | **P11-002 APPROVED** · P11-003 authorized | Active |
| 2026-07-21 | D-057 | **P11-001 APPROVED** · P11-002 authorized | Active |
| 2026-07-21 | D-056 | **RFC-006 + Phase 11 TECHNICAL_SPEC** — APPROVE WITH CONDITIONS (C-011-1..6) | Active |
| 2026-07-21 | D-055 | **Phase 10 CLOSED** — APPROVE WITH CONDITIONS · tag `v0.11-phase-10` | **Closed** |
| 2026-07-21 | TD-P10-2 | Admin Events Viewer UI completion (C-P10-1) | Active (P2) |
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
| 2026-07-21 | D-054 | **Phase 10 Admin Platform Spec** — APPROVE WITH CONDITIONS · implementation AUTHORIZED | **Closed** |
| 2026-07-21 | D-053 | **Phase 9 CLOSED** — APPROVE WITH CONDITIONS · tag `v0.10-phase-9` | **Closed** |
| 2026-07-20 | D-050 | Phase 9 spec — **APPROVE WITH CONDITIONS** · implementation AUTHORIZED | **Closed** |
| 2026-07-20 | TD-NOTIF-2 | Notification Digest Engine | Active (P2) |
| 2026-07-20 | D-052 | Phase 9 notification IAM permissions (P9-014) | Active |
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

## D-066: Phase 12 TECHNICAL_SPEC — APPROVE WITH CONDITIONS

**Decision (2026-07-21):** **APPROVE WITH CONDITIONS** — Phase 12 TECHNICAL_SPEC (Option 1) · authorize **P12-001** (public route shell).

**Documents:**
- [phase-12/TECHNICAL_SPEC.fa.md](./phase-12/TECHNICAL_SPEC.fa.md) ✅ APPROVE WITH CONDITIONS
- [phase-12/IMPLEMENTATION_PLAN.md](./phase-12/IMPLEMENTATION_PLAN.md) · [phase-12/TASKS.md](./phase-12/TASKS.md)

| Condition | Requirement |
|-----------|-------------|
| C-012-1..6 | As in TECHNICAL_SPEC §۷ |
| **C-012-7** | All public pages implement `generateMetadata()` using Phase 11 builders |
| **C-012-8** | `/jobs/[slug]` and `/companies/[slug]` return `notFound()` for invalid or non-public records |
| **C-012-9** | JobPosting JSON-LD only for **PUBLISHED** jobs |
| **C-012-10** | Phase 12 = public SSR only — no admin/dashboard/profile routes |

**Next:** P12-001 → CTO review → authorize subsequent tasks one at a time.

---

## D-065: Phase 11 CLOSED — SEO Foundation (APPROVE CLOSE)

**Decision (2026-07-21):** Phase 11 **CLOSED** · final sign-off **APPROVE CLOSE** · tag **`v0.12-phase-11`**.

**Also records:** P11-009 APPROVED (`5f5d56b`) · P11-010 closure package authorized/delivered (`5f3f015`).

| Item | Value |
|------|-------|
| Spec | D-056 APPROVE WITH CONDITIONS (C-011-1..6) |
| Architecture | RFC-006 **FROZEN** |
| Tasks | P11-001…P11-010 — all DONE |
| Tag | ✅ `v0.12-phase-11` |
| Conditions | C-011-1..6 **satisfied** — no reopen for Phase 12 work |

**Closure docs:** [PHASE_11_CLOSURE_REPORT.md](./phase-11/PHASE_11_CLOSURE_REPORT.md) · [CLOSURE_PACKAGE.md](./phase-11/CLOSURE_PACKAGE.md) · [CTO_REPORT.md](./phase-11/CTO_REPORT.md)

**Not authorized:** Phase 12 implementation until CTO authorizes Phase 12 spec. Handoff: [phase-12/PHASE_12_CTO_HANDOFF.md](./phase-12/PHASE_12_CTO_HANDOFF.md).

---

## D-064: P11-008 APPROVED · P11-009 authorized

**Decision (2026-07-21):** **APPROVE** P11-008 (`cde15fa`) — SEO_STRATEGY phase remap. Authorize **P11-009** (Phase 11 hardening · guards · verify C-011-1..6 · tests only).

**Hard reminders:** no metadata/JSON-LD/sitemap/robots changes · no Phase 12 implementation.

**Next:** P11-009 implementation · then CTO review before P11-010.

---

## D-063: P11-007 APPROVED · P11-008 authorized

**Decision (2026-07-21):** **APPROVE** P11-007 (`e2f6dcf`) — home metadata + JSON-LD wiring. Authorize **P11-008** (remap `SEO_STRATEGY.md` phase labels · docs only · 11/12 boundary).

**Hard reminders:** documentation alignment only · no code/metadata/JSON-LD/sitemap/robots/Phase 12 work.

**Next:** P11-008 implementation · then CTO review before P11-009.

---

## D-062: P11-006 APPROVED · P11-007 authorized

**Decision (2026-07-21):** **APPROVE** P11-006 (`83e1c1b`) — robots SoT (C-011-5). Authorize **P11-007** (wire `/` metadata + Organization/WebSite JSON-LD).

**Hard reminders:** no new sitemap/robots work · no SearchAction · no Phase 12 SSR inventory · no domain SEO expansion.

**Next:** P11-007 implementation · then CTO review before P11-008.

---

## D-061: P11-005 APPROVED · P11-006 authorized

**Decision (2026-07-21):** **APPROVE** P11-005 (`18bed13`) — honest sitemap. Authorize **P11-006** (robots SoT · C-011-5 · `app/robots.ts` · remove conflicting `public/robots.txt`).

**Hard reminders:** no SearchAction · no metadata wiring · no Phase 12 SEO work.

**Next:** P11-006 implementation · then CTO review before P11-007.

---

## D-060: P11-004 APPROVED · P11-005 authorized

**Decision (2026-07-21):** **APPROVE** P11-004 (`80c297b`) — JSON-LD builders. Authorize **P11-005** (SitemapSource + `sitemap.ts` · C-011-2 honesty · no soft-404).

**Hard reminders:** no metadata wiring · no robots (P11-006) · no SearchAction · Option 1 scope only.

**Next:** P11-005 implementation · then CTO review before P11-006.

---

## D-059: P11-003 APPROVED · P11-004 authorized

**Decision (2026-07-21):** **APPROVE** P11-003 (`6c3f871`) — metadata builders. Authorize **P11-004** (JSON-LD structured-data builders · no SearchAction · C-011-4).

**Next:** P11-004 implementation · then CTO review before P11-005.

---

## D-058: P11-002 APPROVED · P11-003 authorized

**Decision (2026-07-21):** **APPROVE** P11-002 (`2b975c4`) — URL normalize + canonical (C-011-6). Authorize **P11-003** (metadata builders).

**Next:** P11-003 implementation · then CTO review before P11-004.

---

## D-057: P11-001 APPROVED · P11-002 authorized

**Decision (2026-07-21):** **APPROVE** P11-001 (`4020a80`) — `seo` module skeleton. Authorize **P11-002** (URL normalize + canonical · C-011-6).

**Next:** P11-002 implementation · then CTO review before P11-003.

---

## D-056: RFC-006 + Phase 11 TECHNICAL_SPEC — APPROVE WITH CONDITIONS

**Decision (2026-07-21):** **APPROVE WITH CONDITIONS** — RFC-006 **FROZEN** · Phase 11 TECHNICAL_SPEC **APPROVED** · scope **Option 1 (SEO Foundation)**.

**Documents:**
- [RFC-006-SEO-ARCHITECTURE.md](./rfc/RFC-006-SEO-ARCHITECTURE.md) ✅ FROZEN
- [phase-11/TECHNICAL_SPEC.fa.md](./phase-11/TECHNICAL_SPEC.fa.md) ✅ APPROVE WITH CONDITIONS
- [phase-11/IMPLEMENTATION_PLAN.md](./phase-11/IMPLEMENTATION_PLAN.md) · [phase-11/TASKS.md](./phase-11/TASKS.md)

| Condition | Requirement |
|-----------|-------------|
| C-011-1 | No implementation until RFC-006 is **FROZEN** (satisfied by this decision) |
| C-011-2 | Sitemap honesty — only live indexable URLs; domain sources empty until Phase 12 pages exist |
| C-011-3 | No new domain SSR pages (jobs/companies/taxonomy/location/static legal) in Phase 11 |
| C-011-4 | AI landings: extension stubs only — no AI Gateway calls; no SearchAction until public search URL is live |
| **C-011-5** | **Single robots Source of Truth** — prefer App Router `robots.ts`; do not keep a second conflicting `public/robots.txt` |
| **C-011-6** | **Self-canonical pagination** for Phase 11 — each paginated URL canonicalizes to itself; `rel` prev/next deferred to Phase 12 |

**Also frozen:** Pagination canonical = self-canonical (C-011-6) · robots single SoT (C-011-5).

**Implementation:** Authorized **under conditions** — start only when CTO/agent instructed to begin P11-001; no migrations for SEO MVP.

**Next:** Execute [TASKS.md](./phase-11/TASKS.md) one task at a time when implementation is started.

---

## D-055: Phase 10 CLOSED — Admin Platform (APPROVE WITH CONDITIONS)

**Decision (2026-07-21):** Phase 10 **CLOSED** · final sign-off **APPROVE WITH CONDITIONS** · recommended tag **`v0.11-phase-10`**.

| Condition | Requirement | Status |
|-----------|-------------|--------|
| C-P10-1 | Events API delivered; Events UI still placeholder — **do not reopen Phase 10**; register **TD-P10-2** | ✅ |

**Accepted findings:** RFC-005 respected · C-005-1/2 · DomainEventLog append-only · Notification Admin C-009-6 · Billing admin refactor · 216/216 tests.

**Delivered:** P10-001..P10-015 · Admin UI shell · platform APIs · viewers · notification admin UI · IAM seed · hardening guards.

**Closure docs:** [PHASE_10_FINAL_REPORT.md](./phase-10/PHASE_10_FINAL_REPORT.md) · [PHASE_10_CLOSURE_REPORT.md](./phase-10/PHASE_10_CLOSURE_REPORT.md)

**Debt from C-P10-1:** [TD-P10-2](#td-p10-2-admin-events-viewer-ui-completion) — Admin Events Viewer UI completion.

**Superseded for Phase 11 auth:** See **D-056** (APPROVE WITH CONDITIONS · plan ready · start on P11-001 instruction).

---

## TD-P10-2: Admin Events Viewer UI completion

**Registered:** 2026-07-21 · **Source:** Closure condition **C-P10-1** (D-055) · **Priority:** P2

**Problem:** `GET /api/v1/admin/events` lists DomainEventLog; `/admin/events` UI remains a placeholder.

**Resolution path:** Implement read-only Events Viewer UI (Admin API consumer only · C-005-1) in a future task — **not** a Phase 10 reopen.

**Related:** TD-P10-1 (route consolidation) · C-010-5 (append-only log)

---

## D-054: Phase 10 Admin Platform Spec Approval

**Decision (2026-07-21):** **APPROVE WITH CONDITIONS** — Phase 10 implementation authorized. **Superseded for status by D-055 (phase closed).**

**Approve according to:**
- [phase-10/TECHNICAL_SPEC.fa.md](./phase-10/TECHNICAL_SPEC.fa.md)
- [phase-10/IMPLEMENTATION_PLAN.md](./phase-10/IMPLEMENTATION_PLAN.md)
- [phase-10/TASKS.md](./phase-10/TASKS.md)

| Condition | Requirement |
|-----------|-------------|
| C-005-1 | Admin UI → Admin API → admin/services → domain modules → DB only (UI never touches DB) |
| C-005-2 | No Feature Flag Engine in Phase 10 — `SystemSetting feature.*` only (TD-ADMIN-1 deferred) |
| DomainEventLog | Append-only — no admin edit/delete |
| Admin notification inbox | Remains read-only (inherits C-009-6) |
| Feature Flag Engine | **Not** implemented in Phase 10 |

**Next:** P10-001 Admin module skeleton — one task at a time; CTO review before P10-002.

---

## D-053: Phase 9 CLOSED — Notification System (APPROVE WITH CONDITIONS)

**Decision (2026-07-21):** Phase 9 **CLOSED** · final sign-off APPROVED · tag **`v0.10-phase-9`**.

| Condition | Requirement | Status |
|-----------|-------------|--------|
| C-P9-1 | Document + verify notification permission seed for existing DBs | ✅ |
| C-P9-2 | Update `README.md` phase/project status; remove stale Phase 0 refs | ✅ |
| C-P9-3 | Register closure decision (this entry) + closure report | ✅ |

**Delivered:** P9-001..P9-015 · 126 unit tests · EventBus · Catalog · Gateway · Stub providers · User/Admin APIs · IAM (D-052).

**Closure docs:** [PHASE_9_FINAL_REPORT.md](./phase-9/PHASE_9_FINAL_REPORT.md) · [PHASE_9_CLOSURE_REPORT.md](./phase-9/PHASE_9_CLOSURE_REPORT.md)

**Not in scope (deferred):** real Email/SMS vendors · BullMQ EventBus · WEBHOOK channel · Digest engine · Phase 10 UI.

**Next authorized step:** Phase 10 **spec only** after tag sign-off — **no implementation** until CTO authorizes.

---

## D-052: Phase 9 Notification IAM Permissions (P9-014)

**Decision:** Introduce notification permission slugs and seed role mappings.

| Slug | Roles |
|------|--------|
| `notifications:read:own` | `job_seeker`, `employer` (+ `super_admin`) |
| `notifications:preferences:own` | `job_seeker`, `employer` (+ `super_admin`) |
| `notifications:admin` | `admin`, `super_admin` |

**Enforcement:** User notification APIs require `read:own` / `preferences:own`. Admin notification APIs require `notifications:admin` (not role-only gate).

**Seed:** `prisma/seed.ts` · constants: `src/modules/notifications/permissions.ts`

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
