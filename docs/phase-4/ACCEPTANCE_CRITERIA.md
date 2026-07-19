# Acceptance Criteria — Phase 4: Jobs Core

**فاز:** 4  
**وضعیت:** ⏳ **Awaiting CTO Spec Approval**

---

## ۱. Documentation

- [ ] TECHNICAL_SPEC.fa.md approved
- [ ] DATABASE_DESIGN.md approved
- [ ] API_DESIGN.md approved
- [ ] SECURITY_REVIEW.md approved

---

## ۲. Database

- [ ] `jobs`, `job_skills`, `job_applications` tables
- [ ] Enums: JobStatus, EmploymentType, ExperienceLevel, ApplicationStatus
- [ ] FKs: company, city, category, subCategory, user
- [ ] AuditAction extended
- [ ] Permissions seed `job:*`

---

## ۳. Jobs Core

- [ ] Employer CRUD (draft)
- [ ] Slug unique + reserved words
- [ ] Publish / pause / close lifecycle
- [ ] Company must be VERIFIED + ACTIVE to publish
- [ ] expiresAt enforced on public list

---

## ۴. Public APIs

- [ ] GET `/jobs` with basic filters
- [ ] GET `/jobs/by-slug/:slug` — published only
- [ ] Pagination

---

## ۵. Applications Foundation

- [ ] POST apply with coverLetter
- [ ] Withdraw application
- [ ] Employer list + status update
- [ ] Job seeker list own applications
- [ ] `resumeId` nullable (Phase 5)

---

## ۶. Quality Gates

- [ ] `npm test` green
- [ ] typecheck + build + prisma validate
- [ ] Module in `src/modules/jobs/` only

---

## ۷. Out of Scope Verification

- [ ] No Resume Builder
- [ ] No AI Matching
- [ ] No Payments
- [ ] No Advertisements
