# Risks and Assumptions — Phase 3: Location & Taxonomy

**فاز:** 3 — Spec only

---

## ۱. Assumptions

| ID | Assumption |
|----|------------|
| A-1 | 31 provinces + cities seed is stable — updates via migration + version bump |
| A-2 | 15 official categories fixed at seed — new categories via suggestion workflow |
| A-3 | `cityLabel` / `industryLabel` kept until backfill complete |
| A-4 | AI Phase 3 = stub — no external API keys in repo |
| A-5 | Jobs Phase 4 consumes `cityId`, `categoryId`, skill/technology IDs |
| A-6 | Persian + English names stored; slug always Latin URL-safe |
| A-7 | Soft delete on taxonomy — jobs FK uses stable IDs |

---

## ۲. Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | cityLabel → cityId backfill incomplete | nullable FK; gradual migration; script |
| R2 | industryLabel fuzzy match errors | manual admin review; no auto-merge without confidence threshold |
| R3 | Taxonomy hierarchy depth queries slow | indexes; cache hot paths Phase 6 |
| R4 | AI suggestion spam | admin-only create in Phase 3; rate limit Phase 13 |
| R5 | Official category accidentally deleted | `isOfficial` + protected delete |
| R6 | Large city seed data size | chunked seed; CI timeout watch |

**Overall technical debt (project):** 🟢 Low

---

## ۳. Phase 2 Carryover

| Item | Phase 3 action |
|------|----------------|
| TD-P2-1 Integration tests | Required before Phase 3 close |
| TD-P2-2 Employer completion score | No change |
| Audit verification | Checklist + tests |
| Rate limiting | Documented deferral |
| SEO metadata | Documented deferral |

---

## ۴. Dependency Chain (CTO-confirmed)

```text
Phase 4 Jobs
    requires Phase 3 Location (cityId)
    requires Phase 3 Taxonomy (categoryId, skills, technologies)
```

**Phase 3 does not include Jobs.**

---

## ۵. Open Questions

| # | Question | Proposed default |
|---|----------|------------------|
| Q-1 | Sample subcategories in seed? | Yes — minimal set per category for demo |
| Q-2 | User-facing suggestion API? | No — admin/AI only Phase 3 |
| Q-3 | Multi-language slug? | Latin slug only; nameFa/nameEn fields |

_Awaiting CTO spec review._
