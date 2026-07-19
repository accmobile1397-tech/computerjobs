# Phase Review Index — Phase 1: IAM

**Commit:** _(see git log on `feature/auth`)_  
**Status:** Implementation complete — awaiting CTO review  
**PR:** `feature/auth` → `develop`

---

## Documents

| Document | Path |
|----------|------|
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
| CTO Report | [docs/phase-1/CTO_REPORT.md](./phase-1/CTO_REPORT.md) |
| Architecture Guardian | [docs/reviews/ARCHITECTURE_GUARDIAN.md](../reviews/ARCHITECTURE_GUARDIAN.md) (Phase 1 section) |
| Threat Model | [docs/security-threat-model/phase-1.md](../security-threat-model/phase-1.md) |
| Test Coverage | [docs/phase-1/TEST_COVERAGE.md](./phase-1/TEST_COVERAGE.md) |

## ADRs

- [0001-feature-first.md](../adr/0001-feature-first.md)
- [0002-prisma.md](../adr/0002-prisma.md)
- [0006-iam-authorization-module.md](../adr/0006-iam-authorization-module.md) _(new)_

## RFCs

- No new RFCs Phase 1

## Database Changes

- Migration: `prisma/migrations/20260719140000_phase1_iam/`
- Models: User, profiles, RBAC, tokens, audit, Company, CompanyMember
- Seed: roles, permissions, SuperAdmin

## API Changes

| Endpoint | New |
|----------|-----|
| POST /auth/register/job-seeker | ✅ |
| POST /auth/register/employer | ✅ |
| POST /auth/login | ✅ (identifier: email/mobile-ready) |
| POST /auth/refresh | ✅ |
| POST /auth/logout | ✅ |
| POST /auth/logout-all | ✅ |
| POST /auth/forgot-password | ✅ |
| POST /auth/reset-password | ✅ |
| GET/POST /auth/verify-email | ✅ |
| GET/PATCH /users/me | ✅ |

## Security Changes

- argon2id password hashing
- JWT access + refresh (httpOnly cookie)
- DB-driven RBAC via `modules/authorization/`
- Audit log events expanded
- Account lock + LOCKED status
- [SECURITY_DECISIONS.md](../SECURITY_DECISIONS.md) updated

## SEO Changes

- None (auth pages noindex in SEO_STRATEGY)

## Known Risks

- Mobile login schema ready — not enabled
- Email/SMS stub only
- Rate limit skeleton
- See [RISKS_AND_ASSUMPTIONS.md](./phase-1/RISKS_AND_ASSUMPTIONS.md)
