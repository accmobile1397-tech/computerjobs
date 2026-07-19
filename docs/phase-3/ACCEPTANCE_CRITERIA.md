# Acceptance Criteria — Phase 3: Location & Taxonomy

**فاز:** 3  
**وضعیت:** ⏳ **Awaiting CTO Spec Approval**

---

## ۱. Documentation

- [ ] TECHNICAL_SPEC.fa.md approved
- [ ] DATABASE_DESIGN.md approved
- [ ] API_DESIGN.md approved
- [ ] SECURITY_REVIEW.md approved

---

## ۲. Database

- [ ] `provinces`, `cities` tables + seed 31 provinces
- [ ] `categories`, `subcategories`, `skills`, `technologies` tables
- [ ] Seed 15 official categories
- [ ] `taxonomy_suggestions` table + enums
- [ ] `job_seeker_profiles.cityId` nullable FK
- [ ] `companies.categoryId` nullable FK
- [ ] AuditAction extended (location + taxonomy)
- [ ] Permissions seed `location:*`, `taxonomy:*`

---

## ۳. Location Module

- [ ] Public GET provinces + cities by slug
- [ ] Admin PATCH province/city (isActive, sortOrder)
- [ ] Seed in `modules/location/seed/`
- [ ] Audit: `PROVINCE_UPDATED`, `CITY_UPDATED`

---

## ۴. Taxonomy Module

- [ ] Public read APIs for full hierarchy
- [ ] Admin CRUD (soft delete) all levels
- [ ] Slug unique per scope + reserved words
- [ ] Official categories protected from hard delete

---

## ۵. AI Suggestion + Approval

- [ ] POST suggestion → status PENDING only
- [ ] AI/stub cannot set APPROVED directly
- [ ] Approve creates published entity
- [ ] Reject + Merge flows
- [ ] Audit: `TAXONOMY_SUGGESTION_*`

---

## ۶. Phase 2 Migration

- [ ] PATCH job-seeker profile accepts `cityId`
- [ ] PATCH company accepts `categoryId`
- [ ] `cityLabel` / `industryLabel` backward compatible
- [ ] Optional backfill script documented

---

## ۷. Phase 2 Carryover (before Phase 3 close)

- [ ] Integration tests: Profile API, Company API, Invite flow, Ownership transfer (TD-P2-1)
- [ ] Audit verification checklist for Phase 2 events (CTO Condition 2)

---

## ۸. Quality Gates

- [ ] `npm test` green (unit + new integration tests)
- [ ] `npm run typecheck` green
- [ ] `npm run build` green
- [ ] `npx prisma validate` green
- [ ] No Rulebook violations — separate `location/` and `taxonomy/` modules

---

## ۹. Out of Scope Verification

- [ ] No Jobs APIs
- [ ] No AI Gateway production provider
- [ ] No SSR location/taxonomy pages (API only)
- [ ] No rate limiting implementation (spec note only)
