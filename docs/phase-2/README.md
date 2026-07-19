# Phase 2 — User Profiles & Company Management

**Status:** 🟢 **Approved for Implementation** — CTO APPROVE WITH MINOR CONDITIONS (2026-07-19)  
**Branch:** `main`  
**Implementation:** ⏳ **Ready to start — not yet coded**

## Documents

| File | Purpose |
|------|---------|
| [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) | مشخصات فنی (v2.1 — CTO conditions applied) |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema extensions |
| [API_DESIGN.md](./API_DESIGN.md) | Endpoints |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) | Security spec |
| [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) | Test checklist |
| [RISKS_AND_ASSUMPTIONS.md](./RISKS_AND_ASSUMPTIONS.md) | Risks & Phase 3 roadmap |

## CTO Minor Conditions (applied)

1. `users.slug` for future `/profiles/{slug}`
2. Company `status`: ACTIVE / SUSPENDED / DELETED
3. Verification: PENDING → UNDER_REVIEW → VERIFIED / REJECTED
4. Audit events: PROFILE_*, COMPANY_*, MEMBER_*, OWNERSHIP_TRANSFERRED
5. `industryLabel` → `industryId` migration path (Phase 3)
6. `avatarUrl` / `logoUrl` — URL only, no upload
7. `cityLabel` retained until Phase 3 Location

## Phase 3 (planned — not started)

Location · Taxonomy · Skills · Technologies

## Out of Scope Phase 2

Upload logic · Location FK · Taxonomy FK · Jobs
