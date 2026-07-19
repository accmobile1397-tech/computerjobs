# Phase 2 — User Profiles & Company Management

**Status:** 📋 Spec generated — awaiting CTO approval  
**Branch (after approval):** `main`  
**Implementation:** ❌ **NOT STARTED — spec only**

## Documents

| File | Purpose |
|------|---------|
| [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) | **مشخصات فنی فارسی — CTO review** |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema extensions |
| [API_DESIGN.md](./API_DESIGN.md) | Endpoints |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) | Security spec |
| [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) | Test checklist |
| [RISKS_AND_ASSUMPTIONS.md](./RISKS_AND_ASSUMPTIONS.md) | Risks & assumptions |

## Gate

🔴 **Phase 2 Approved for Implementation** — only after CTO approves TECHNICAL_SPEC + DATABASE + API

## Builds on Phase 1

- `JobSeekerProfile`, `EmployerProfile` (extend fields)
- `Company`, `CompanyMember` (full CRUD + invites)
- `users/` + new `companies/` module

## Out of Scope (Phase 2)

- Location module implementation (skeleton only — free-text city until Phase 3)
- Taxonomy module implementation (industry as optional string stub)
- Job posting, resume builder, search
- OAuth, 2FA, real email delivery

## CTO Conditions from Phase 1 (still active)

- Shared module migration continues in future phases
- Taxonomy skeleton remains planned
- Location skeleton remains planned
