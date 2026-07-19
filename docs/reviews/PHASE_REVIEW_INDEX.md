# Phase Review Index

---

# Phase 1 — IAM (Closed)

**Tag:** `v0.2-phase-1` · **Commit:** [`769b6de`](https://github.com/accmobile1397-tech/computerjobs/commit/769b6de)

---

# Phase 2 — Profiles & Companies (Closed)

**Tag:** `v0.3-phase-2` · [`847fe54..fe7bc85`](https://github.com/accmobile1397-tech/computerjobs/compare/847fe54...fe7bc85)

[CTO_IMPLEMENTATION_APPROVAL.md](./phase-2/CTO_IMPLEMENTATION_APPROVAL.md)

---

# Phase 3 — Location & Taxonomy (Review)

**Status:** ⏳ Awaiting CTO Review  
**Branch:** `main`  
**Migration:** `20260719180000_phase3_location_taxonomy`

## Start Here

| Document | Path |
|----------|------|
| **CTO Report** | [docs/phase-3/CTO_REPORT.md](./phase-3/CTO_REPORT.md) |
| Spec approval | [docs/phase-3/CTO_SPEC_APPROVAL.md](./phase-3/CTO_SPEC_APPROVAL.md) |
| Technical Spec | [docs/phase-3/TECHNICAL_SPEC.fa.md](./phase-3/TECHNICAL_SPEC.fa.md) |
| Database | [docs/phase-3/DATABASE_DESIGN.md](./phase-3/DATABASE_DESIGN.md) |
| API | [docs/phase-3/API_DESIGN.md](./phase-3/API_DESIGN.md) |
| Tests | [docs/phase-3/TEST_COVERAGE.md](./phase-3/TEST_COVERAGE.md) |
| Guardian | [ARCHITECTURE_GUARDIAN.md](./ARCHITECTURE_GUARDIAN.md) (Phase 3) |

## Modules

- `src/modules/location/` — provinces, cities, seed
- `src/modules/taxonomy/` — hierarchy, suggestions, approval

## Public API

`/locations/provinces`, `/locations/provinces/:slug/cities`  
`/taxonomy/categories`, `/taxonomy/skills/:slug`, `/taxonomy/technologies/:slug`

## Admin API

`/admin/locations/*`, `/admin/taxonomy/suggestions/*`
