# Phase Review Index — Phase 1: IAM

**Branch:** `main`  
**Implementation commit:** [`769b6de`](https://github.com/accmobile1397-tech/computerjobs/commit/769b6de)  
**Status:** ⏳ Awaiting CTO approval  
**Start review:** [docs/phase-1/CTO_REPORT.md](./phase-1/CTO_REPORT.md)

---

## Documents

| Document | Path |
|----------|------|
| **CTO Report** | [docs/phase-1/CTO_REPORT.md](./phase-1/CTO_REPORT.md) |
| Technical Spec (FA) | [docs/phase-1/TECHNICAL_SPEC.fa.md](./phase-1/TECHNICAL_SPEC.fa.md) |
| Architecture | [docs/phase-1/ARCHITECTURE.md](./phase-1/ARCHITECTURE.md) |
| Database Design | [docs/phase-1/DATABASE_DESIGN.md](./phase-1/DATABASE_DESIGN.md) |
| API Design | [docs/phase-1/API_DESIGN.md](./phase-1/API_DESIGN.md) |
| Security Review | [docs/phase-1/SECURITY_REVIEW.md](./phase-1/SECURITY_REVIEW.md) |
| Acceptance Criteria | [docs/phase-1/ACCEPTANCE_CRITERIA.md](./phase-1/ACCEPTANCE_CRITERIA.md) |
| Risks | [docs/phase-1/RISKS_AND_ASSUMPTIONS.md](./phase-1/RISKS_AND_ASSUMPTIONS.md) |

## Reports

| Report | Path |
|--------|------|
| Architecture Guardian | [docs/reviews/ARCHITECTURE_GUARDIAN.md](../reviews/ARCHITECTURE_GUARDIAN.md) (Phase 1) |
| Threat Model | [docs/security-threat-model/phase-1.md](../security-threat-model/phase-1.md) |
| Test Coverage | [docs/phase-1/TEST_COVERAGE.md](./phase-1/TEST_COVERAGE.md) |
| Handoff guide | [docs/reviews/CTO_HANDOFF.md](../reviews/CTO_HANDOFF.md) |

## ADRs

- [0006-iam-authorization-module.md](../adr/0006-iam-authorization-module.md)

## Database

- Migration: `prisma/migrations/20260719140000_phase1_iam/`
- Seed: roles, permissions, SuperAdmin

## API (Phase 1)

Auth: register (job-seeker/employer), login, refresh, logout, logout-all, forgot/reset password, verify-email  
Users: GET/PATCH `/users/me`

## Security

argon2id · JWT + httpOnly refresh · DB RBAC · audit log · account lock · no OAuth

## SEO

None (auth pages noindex)
