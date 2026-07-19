# Risks and Assumptions — Phase 2: Profiles & Companies

**فاز:** 2 — Approved spec

---

## ۱. Assumptions

| ID | Assumption |
|----|------------|
| A-1 | `users.slug` globally unique — one slug per user account |
| A-2 | `cityLabel` until Phase 3 — **CTO confirmed** |
| A-3 | `industryLabel` until Phase 3 — migrates to `industryId` |
| A-4 | **avatarUrl / logoUrl URL only — no upload Phase 2** (CTO) |
| A-5 | Company `status` separate from `verificationStatus` |
| A-6 | UNDER_REVIEW requires admin action |
| A-7 | Profile visibility enum unchanged (CTO approved) |

---

## ۲. Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | User slug collision | unique index; reserved slugs |
| R2 | industryLabel → industryId migration | documented Phase 3 path |
| R3 | cityLabel → cityId migration | Phase 3 FK nullable transition |
| R4 | SUSPENDED company still in search cache | invalidate on status change (future) |

**Overall technical debt:** 🟢 Low (CTO assessment)

---

## ۳. Phase 3 Roadmap (CTO)

| In Phase 3 | Not in Phase 3 |
|------------|----------------|
| Location | Jobs |
| Taxonomy | |
| Skills | |
| Technologies | |

Dependency chain: **Jobs → Taxonomy → Location**

---

## ۴. CTO Minor Conditions (applied 2026-07-19)

- [x] User slug (`users.slug`)
- [x] Company status (ACTIVE/SUSPENDED/DELETED)
- [x] UNDER_REVIEW in verification workflows
- [x] Complete audit event list
- [x] industryLabel → industryId migration note

---

## ۵. Open Questions

_All resolved by CTO 2026-07-19 — APPROVE WITH MINOR CONDITIONS._
