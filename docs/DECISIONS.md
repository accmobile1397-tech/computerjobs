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
| 2026-07-19 | D-028 | **Product roadmap** Phases 2–8 (CTO-approved order) | Active |
| 2026-07-19 | D-029 | **Phase 2 CLOSED** — APPROVE WITH CONDITIONS · tag `v0.3-phase-2` | **Closed** |
| 2026-07-19 | D-030 | Phase 3 spec — **APPROVE** · implementation authorized | **Closed** |
| 2026-07-19 | D-031 | **Phase 3 CLOSED** — APPROVE · tag `v0.4-phase-3` | **Closed** |
| 2026-07-19 | D-032 | Phase 4 spec — **APPROVE WITH MINOR CONDITIONS** | **Closed** |
| 2026-07-19 | D-033 | **Phase 4 CLOSED** — APPROVE · tag `v0.5-phase-4` | **Closed** |
| 2026-07-19 | D-034 | Phase 5 spec — Resume Builder (spec only) | Active |
| 2026-07-19 | D-022 | **CTO handoff:** commit link on `main` | Active |
| 2026-07-19 | D-023 | No feature branches | **Superseded by D-024** |
| 2026-07-19 | D-024 | **Direct commits on `main`** — no develop branch | Active |
| 2026-07-19 | D-025 | **`develop` branch deleted** from local + remote | Active |

---

## D-028: Product Roadmap (CTO-Approved)

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

## D-034: Phase 5 Spec — Resume Builder

**Decision:** Spec generated — **awaiting CTO review**  
**Status:** Implementation **blocked** until CTO approves  
**Spec commit:** [`5724527`](https://github.com/accmobile1397-tech/computerjobs/commit/5724527)  
**Scope:** Resume Builder, Education, Experience, Skills, Technologies, Languages, Certificates, Projects, Candidate Resume Visibility  
**Rules:** One active resume per user · no upload · no AI · no matching engine  

**Documents:** `docs/phase-5/`

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
