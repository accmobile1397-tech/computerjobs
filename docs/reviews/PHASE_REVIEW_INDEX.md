# Phase Review Index

---

# Phase 1 — IAM (Closed) · `v0.2-phase-1`

# Phase 2 — Profiles & Companies (Closed) · `v0.3-phase-2`

# Phase 3 — Location & Taxonomy (Closed) · `v0.4-phase-3`

[CTO_IMPLEMENTATION_APPROVAL.md](./phase-3/CTO_IMPLEMENTATION_APPROVAL.md)

---

# Phase 4 — Jobs Core (Review)

**Status:** ⏳ Awaiting CTO Review  
**Migration:** `20260719200000_phase4_jobs_core`

## Start Here

| Document | Path |
|----------|------|
| **CTO Report** | [docs/phase-4/CTO_REPORT.md](./phase-4/CTO_REPORT.md) |
| Spec approval | [docs/phase-4/CTO_SPEC_APPROVAL.md](./phase-4/CTO_SPEC_APPROVAL.md) |
| Technical Spec | [docs/phase-4/TECHNICAL_SPEC.fa.md](./phase-4/TECHNICAL_SPEC.fa.md) |
| Database | [docs/phase-4/DATABASE_DESIGN.md](./phase-4/DATABASE_DESIGN.md) |
| API | [docs/phase-4/API_DESIGN.md](./phase-4/API_DESIGN.md) |
| Tests | [docs/phase-4/TEST_COVERAGE.md](./phase-4/TEST_COVERAGE.md) |

## Module

`src/modules/jobs/` — jobs + applications

## API

Public: `GET /jobs`, `GET /jobs/by-slug/:slug`  
Employer: CRUD + publish/pause/close  
Applications: apply, withdraw, employer manage  
Admin: `POST /admin/jobs/:id/approve`
