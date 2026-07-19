# Phase 3 — Location, Taxonomy, Skills & Technologies

**Status:** ⏳ **Specification — awaiting CTO review**  
**Implementation:** ❌ Blocked until CTO approves spec

## Scope (CTO-approved roadmap)

| Domain | Entities |
|--------|----------|
| **Location** | Province, City |
| **Taxonomy** | Category, SubCategory, Skill, Technology |
| **Governance** | AI suggestion workflow, Admin approval workflow |

**Not in Phase 3:** Jobs, Resume, Search, Payments, full AI Gateway

## Documents

| File | Purpose |
|------|---------|
| [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) | مشخصات فنی |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema + migrations from Phase 2 labels |
| [API_DESIGN.md](./API_DESIGN.md) | Public + admin endpoints |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) | Security spec |
| [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) | Test checklist |
| [RISKS_AND_ASSUMPTIONS.md](./RISKS_AND_ASSUMPTIONS.md) | Risks |

## Dependencies

- Phase 2 closed (`v0.3-phase-2`)
- Jobs (Phase 4) requires Location + Taxonomy from this phase

## Modules

- `src/modules/location/` — province, city, seed
- `src/modules/taxonomy/` — category, subcategory, skill, technology, suggestion, approval

## After CTO Spec Approval

Implementation on `main` (incremental commits) → `CTO_REPORT` → Guardian → Index → tag `v0.4-phase-3`
