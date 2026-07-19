# مشخصات فنی — Phase 5: Resume Builder

**پروژه:** ComputerJobs.ir · **فاز:** 5 · **وضعیت:** ✅ Spec APPROVE WITH MINOR CONDITIONS — implementation authorized

---

## ۱. Scope

Resume Builder · Education · Experience · Skills · Technologies · Languages · Certificates · Projects · Candidate Resume Visibility · Application `resumeId` link

**Out:** upload · AI · matching · templates · PDF export · multi-resume

---

## ۲. CTO Rules

| # | Rule |
|---|------|
| R-1 | One resume per user (`userId` unique) |
| R-2 | No file upload |
| R-3 | No AI implementation |
| R-4 | No matching engine |
| R-5 | JOB_SEEKER only for owner APIs |
| R-6 | Skills/Technologies = Taxonomy FK only |
| R-7 | **User owns slug** — Resume has **no** slug field; public URL via `users.slug` |
| R-8 | unique `skillId` / `technologyId` per resume (composite PK + service dedupe) |

---

## ۳. CTO Minor Conditions

| # | Condition |
|---|-----------|
| 1 | `ResumeStatus`: DRAFT, ACTIVE |
| 2 | unique skillId / technologyId per resume |
| 3 | Slug on User only |
| 4 | Reserved nullable: `profileStrength`, `aiSummary`, `aiKeywords` (no AI writes) |
| 5 | TD-P5-1 Application Resume Snapshot — **P1** (deferred) |

---

## ۴. Resume Core

| Field | Notes |
|-------|--------|
| status | DRAFT default · ACTIVE for public/employer/apply attach |
| visibility | PRIVATE · EMPLOYERS_ONLY · PUBLIC |
| completionScore | computed 0–100 |
| profileStrength / aiSummary / aiKeywords | reserved nullable — unused Phase 5 |

**Visibility:** PRIVATE owner-only · EMPLOYERS_ONLY on own-job applications · PUBLIC via `GET /users/by-slug/:slug/resume`

Public/employer reads require `status=ACTIVE` (except owner always sees own).

---

## ۵. Sections (caps)

Education · Experience (optional cityId) · Skills≤30 · Technologies≤30 · Languages≤10 · Certificates · Projects (≤10 tech each)

---

## ۶. Application

- Auto-set `resumeId` on apply if user has ACTIVE resume (optional body override)
- Apply without resume allowed
- Live FK — **TD-P5-1** snapshot deferred

---

## ۷. Module

`src/modules/resumes/` · minimal wire in `application.service.ts`

Permissions: `resume:read:own`, `resume:update:own`, `resume:read:employer`, `resume:read:public`

---

## ۸. Technical Debt

| ID | Item | Priority |
|----|------|----------|
| TD-P5-1 | Application Resume Snapshot (immutable copy at apply) | P1 |

---

## References

Phase 4 closed — `v0.5-phase-4` · `.cto/RULEBOOK.md` · `.cto/TOKEN_OPTIMIZATION.md`
