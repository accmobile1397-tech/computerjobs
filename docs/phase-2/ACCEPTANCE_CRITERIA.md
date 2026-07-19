# Acceptance Criteria — Phase 2: Profiles & Companies

**فاز:** 2  
**وضعیت:** Spec approval pending

---

## ۱. Documentation (Pre-Implementation)

- [ ] `TECHNICAL_SPEC.fa.md` — CTO approved
- [ ] `DATABASE_DESIGN.md` — CTO approved
- [ ] `API_DESIGN.md` — CTO approved
- [ ] `SECURITY_REVIEW.md`
- [ ] `ACCEPTANCE_CRITERIA.md`
- [ ] `RISKS_AND_ASSUMPTIONS.md`

**Gate:** 🟢 Phase 2 Approved for Implementation

---

## ۲. Database

- [ ] Migration `phase2_profiles_companies` applies cleanly
- [ ] JobSeekerProfile extended fields
- [ ] Company extended fields + slug unique
- [ ] CompanyInvite table
- [ ] New permissions seeded
- [ ] AuditAction enum extended

---

## ۳. Job Seeker Profile

- [ ] GET/PATCH `/users/me/job-seeker-profile`
- [ ] completionScore computed on save
- [ ] profileVisibility enforced on read paths
- [ ] cityLabel stored (no Location FK yet)

---

## ۴. Employer Profile

- [ ] GET/PATCH `/users/me/employer-profile`
- [ ] Link to company after company create

---

## ۵. Company CRUD

- [ ] POST `/companies` creates company + OWNER member
- [ ] GET/PATCH/DELETE `/companies/:id` with authz
- [ ] GET `/companies/by-slug/:slug` public (verified only)
- [ ] Slug validation + uniqueness

---

## ۶. Members & Invites

- [ ] List/remove/update member roles
- [ ] Invite create / accept / revoke
- [ ] Cannot remove OWNER via DELETE member
- [ ] Transfer ownership endpoint

---

## ۷. Admin

- [ ] PATCH admin company verification (stub OK)
- [ ] Requires `company:verify` permission

---

## ۸. Authorization

- [ ] All routes use authorization.service
- [ ] No hardcoded role checks in routes
- [ ] New permissions in seed

---

## ۹. Security

- [ ] Plain-text bio (no HTML) or sanitize
- [ ] websiteUrl scheme validation
- [ ] Invite token hashed
- [ ] Audit events for profile/company changes

---

## ۱۰. Tests & CI

- [ ] Unit tests for slug generator, completion score
- [ ] `npm test` green
- [ ] `npm run build` green
- [ ] CI green on `main`

---

## ۱۱. Code Quality

- [ ] Logic in `modules/users/` and `modules/companies/`
- [ ] Thin API routes
- [ ] Conventional commits on `main`

---

## ۱۲. Definition of Done

Phase 2 **Done** when §2–§11 pass + CTO final review via commit link on `main`.

**Do NOT start Phase 3** without explicit approval.
