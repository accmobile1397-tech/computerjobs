# Phase Review Index

# Phase 1–4 — Closed

`v0.2-phase-1` · `v0.3-phase-2` · `v0.4-phase-3` · `v0.5-phase-4`

---

# Phase 5 — Resume Builder (Review)

**Status:** ⏳ Awaiting CTO Review  
**Migration:** `20260719220000_phase5_resume_builder`

| Document | Path |
|----------|------|
| **CTO Report** | [docs/phase-5/CTO_REPORT.md](./phase-5/CTO_REPORT.md) |
| Spec approval | [docs/phase-5/CTO_SPEC_APPROVAL.md](./phase-5/CTO_SPEC_APPROVAL.md) |
| Technical Spec | [docs/phase-5/TECHNICAL_SPEC.fa.md](./phase-5/TECHNICAL_SPEC.fa.md) |
| Tests | [docs/phase-5/TEST_COVERAGE.md](./phase-5/TEST_COVERAGE.md) |

## Module

`src/modules/resumes/`

## API

- Owner: `GET/PATCH /users/me/resume` + section routes
- Public: `GET /users/by-slug/:slug/resume` (user slug)
- Employer: `GET /jobs/:id/applications/:applicationId/resume`
