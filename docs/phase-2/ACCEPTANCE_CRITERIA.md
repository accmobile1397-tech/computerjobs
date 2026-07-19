# Acceptance Criteria — Phase 2: Profiles & Companies

**فاز:** 2  
**وضعیت:** 🟢 **Approved for Implementation** (CTO 2026-07-19)

---

## ۱. Documentation

- [x] CTO APPROVE WITH MINOR CONDITIONS applied to spec
- [x] TECHNICAL_SPEC.fa.md
- [x] DATABASE_DESIGN.md
- [x] API_DESIGN.md

---

## ۲. Database

- [ ] `users.slug` unique nullable
- [ ] JobSeekerProfile extended fields + cityLabel
- [ ] EmployerVerificationStatus: PENDING, UNDER_REVIEW, VERIFIED, REJECTED
- [ ] CompanyVerificationStatus + CompanyStatus (ACTIVE/SUSPENDED/DELETED)
- [ ] CompanyInvite table
- [ ] AuditAction enum (§ CTO list)
- [ ] industryLabel only (no industryId Phase 2)

---

## ۳. User slug

- [ ] PATCH `/users/me/slug`
- [ ] GET `/profiles/by-slug/:slug` (visibility enforced)
- [ ] Slug unique + reserved words

---

## ۴. Profiles

- [ ] GET/PATCH job-seeker profile
- [ ] GET/PATCH employer profile
- [ ] avatarUrl / logoUrl — URL only, **no upload endpoints**
- [ ] profileVisibility: PUBLIC / EMPLOYERS_ONLY / PRIVATE

---

## ۵. Company

- [ ] CRUD with status + verification
- [ ] Public slug: VERIFIED + ACTIVE only
- [ ] industryLabel stored (migration path to industryId documented)

---

## ۶. Members & Invites

- [ ] Invite / accept / remove
- [ ] Audit: MEMBER_INVITED, MEMBER_ACCEPTED, MEMBER_REMOVED
- [ ] OWNERSHIP_TRANSFERRED audit

---

## ۷. Admin

- [ ] Employer verification workflow with UNDER_REVIEW
- [ ] Company verification + status (SUSPEND)

---

## ۸. Security & CI

- [ ] All authz via authorization module
- [ ] Audit events complete
- [ ] npm test + build green

---

## ۹. Definition of Done

Phase 2 done when §2–§8 pass + CTO final review on `main`.

**Phase 3 (planned):** Location · Taxonomy · Skills · Technologies — not Jobs.
