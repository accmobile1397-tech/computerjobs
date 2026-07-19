# Phase 2 — User Profiles & Company Management

**Status:** ⏳ Implementation complete — awaiting CTO review  
**Implementation:** [`847fe54..main`](https://github.com/accmobile1397-tech/computerjobs/compare/847fe54...main)
**Spec approval record:** [CTO_SPEC_APPROVAL.md](./CTO_SPEC_APPROVAL.md)

## Documents

| File | Purpose |
|------|---------|
| [CTO_SPEC_APPROVAL.md](./CTO_SPEC_APPROVAL.md) | **CTO final APPROVE + implementation guidelines** |
| [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) | مشخصات فنی |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema extensions |
| [API_DESIGN.md](./API_DESIGN.md) | Endpoints |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) | Security spec |
| [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) | Test checklist |
| [RISKS_AND_ASSUMPTIONS.md](./RISKS_AND_ASSUMPTIONS.md) | Risks |

## Implementation Guidelines (CTO)

1. `completionScore` — backend-computed only  
2. Slugs — unique, URL-safe, stable  
3. Soft delete — Phase 1 pattern  
4. Invite tokens — hash only  
5. Public company API — public fields only  

## Architecture

Keep `users/`, profile logic, and `companies/` from becoming a single God Module.

## After Implementation

Commit → `CTO_REPORT.md` → Guardian → Index → CTO review → tag (e.g. `v0.3-phase-2`)
