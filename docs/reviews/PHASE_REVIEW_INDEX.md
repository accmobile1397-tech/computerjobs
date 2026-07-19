# Phase Review Index

---

# Phase 1 — IAM (Closed)

**Tag:** `v0.2-phase-1` · **Commit:** [`769b6de`](https://github.com/accmobile1397-tech/computerjobs/commit/769b6de)

[Full index — Phase 1 docs](./phase-1/CTO_REPORT.md)

---

# Phase 2 — Profiles & Companies (Review)

**Status:** ⏳ Awaiting CTO Review  
**Branch:** `main`  
**Migration:** `20260719160000_phase2_profiles_companies`

## Start Here

| Document | Path |
|----------|------|
| **CTO Report** | [docs/phase-2/CTO_REPORT.md](./phase-2/CTO_REPORT.md) |
| Spec | [docs/phase-2/TECHNICAL_SPEC.fa.md](./phase-2/TECHNICAL_SPEC.fa.md) |
| Database | [docs/phase-2/DATABASE_DESIGN.md](./phase-2/DATABASE_DESIGN.md) |
| API | [docs/phase-2/API_DESIGN.md](./phase-2/API_DESIGN.md) |
| Security | [docs/phase-2/SECURITY_REVIEW.md](./phase-2/SECURITY_REVIEW.md) |
| Tests | [docs/phase-2/TEST_COVERAGE.md](./phase-2/TEST_COVERAGE.md) |
| Guardian | [ARCHITECTURE_GUARDIAN.md](./ARCHITECTURE_GUARDIAN.md) (Phase 2) |

## Modules

- `src/modules/users/` — profiles, slug, completion score
- `src/modules/companies/` — CRUD, members, invites

## API (new)

Profiles: `/users/me/slug`, `/users/me/job-seeker-profile`, `/users/me/employer-profile`, `/profiles/by-slug/:slug`  
Companies: `/companies`, `/companies/mine`, `/companies/:id`, `/companies/by-slug/:slug`, members, invites, transfer  
Admin: `/admin/employers/:userId/verification`, `/admin/companies/:id/verification`, `/admin/companies/:id/status`
