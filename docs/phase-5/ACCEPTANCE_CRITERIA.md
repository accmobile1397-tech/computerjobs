# Acceptance Criteria — Phase 5: Resume Builder

**فاز:** 5  
**وضعیت:** ⏳ **Awaiting CTO Spec Approval**

---

## ۱. Documentation

- [ ] TECHNICAL_SPEC.fa.md approved
- [ ] DATABASE_DESIGN.md approved
- [ ] API_DESIGN.md approved
- [ ] SECURITY_REVIEW.md approved

---

## ۲. Database

- [ ] `resumes` + 8 section tables + project_technologies M2M
- [ ] Enums: ResumeVisibility, LanguageProficiency, SkillProficiency
- [ ] `userId` unique on Resume (one per user)
- [ ] `JobApplication.resumeId` FK to Resume
- [ ] AuditAction extended RESUME_*
- [ ] Permissions seed `resume:*`

---

## ۳. Resume Builder

- [ ] GET/PATCH `/users/me/resume`
- [ ] CRUD all sections (education, experience, languages, certificates, projects)
- [ ] PUT skills + technologies (taxonomy FK validated)
- [ ] completionScore computed on mutation
- [ ] Max limits enforced (skills 30, technologies 30, languages 10)

---

## ۴. Candidate Resume Visibility

- [ ] PRIVATE — owner only
- [ ] EMPLOYERS_ONLY — employer on own job applications
- [ ] PUBLIC — `/users/by-slug/:slug/resume`

---

## ۵. Application Integration

- [ ] Auto-link resume on apply when exists
- [ ] Optional explicit `resumeId` in apply body
- [ ] Employer fetch applicant resume when permitted

---

## ۶. Quality Gates

- [ ] `npm test` green
- [ ] typecheck + build + prisma validate
- [ ] Module in `src/modules/resumes/` only (+ minimal jobs application wiring)

---

## ۷. Out of Scope Verification

- [ ] No file upload endpoints
- [ ] No AI services or endpoints
- [ ] No matching / search engine
- [ ] One resume per user enforced
