# Phase 1 — Identity & Access Management (IAM)

**Status:** Not started — awaiting spec approval  
**Branch:** `feature/auth` (from `develop`)

## Scope (expanded from "Auth only")

Phase 1 establishes the **full identity foundation** for all later phases:

- Registration & login (job seeker, employer)
- JWT + refresh tokens
- RBAC: roles, permissions, role assignments
- User types: job seeker, employer, admin
- Password hashing, session security baseline
- Module: `src/modules/auth/`

## Out of Scope

- OAuth/social login (future)
- Full rate limiting (Phase 13 skeleton optional)
- Location, taxonomy, jobs

## Prerequisites

- [x] Phase 0 approved
- [x] `src/modules/` structure
- [x] `develop` branch
- [ ] Phase 1 TECHNICAL_SPEC.md — **pending approval**

## References

- `.cto/SECURITY_RULES.md`
- `docs/adr/0001-feature-first.md`
- `docs/DECISIONS.md` D-012
