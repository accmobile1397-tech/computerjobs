# Phase 4 — Jobs Core

**Status:** ⏳ **Specification — awaiting CTO review**  
**Implementation:** ❌ Blocked until CTO approves spec

## Scope (CTO)

| In scope | Out of scope |
|----------|--------------|
| Jobs Core | Resume Builder (Phase 5) |
| Job Lifecycle | AI Matching (Phase 6) |
| Job Slug + Public APIs | Payments (Phase 7) |
| Basic Filtering | Advertisements |
| Application Foundation | SSR job pages (Phase 12) |

## Documents

| File | Purpose |
|------|---------|
| [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) | مشخصات فنی |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema |
| [API_DESIGN.md](./API_DESIGN.md) | Endpoints |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) | Security |
| [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) | Checklist |
| [RISKS_AND_ASSUMPTIONS.md](./RISKS_AND_ASSUMPTIONS.md) | Risks |

## Dependencies

- Phase 3 closed (`v0.4-phase-3`) — Location + Taxonomy
- Phase 2 — Company + IAM

## Module

`src/modules/jobs/` — posting, lifecycle, applications (foundation)

## After CTO Spec Approval

Incremental commits on `main` → `CTO_REPORT` → tag `v0.5-phase-4`
