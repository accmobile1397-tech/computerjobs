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
| 2026-07-19 | D-021 | Phase 1 IAM on `main` commit `66e08b9` | Pending CTO |
| 2026-07-19 | D-022 | **CTO handoff:** commit link on `main` | Active |
| 2026-07-19 | D-023 | No feature branches | **Superseded by D-024** |
| 2026-07-19 | D-024 | **Direct commits on `main`** — no develop branch | Active |
| 2026-07-19 | D-025 | **`develop` branch deleted** from local + remote | Active |

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

## D-021: Phase 1 IAM Implementation (Pending CTO)

Branch `main`, latest commit `66e08b9`. Awaiting CTO review.

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
