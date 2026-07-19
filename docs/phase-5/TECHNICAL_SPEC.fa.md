# مشخصات فنی — Phase 5: Resume Builder

**پروژه:** ComputerJobs.ir  
**نسخه:** 5.0.0-spec  
**فاز:** 5  
**وضعیت:** ⏳ **در انتظار تأیید CTO** — **بدون پیاده‌سازی کد**

---

## ۱. هدف Phase 5

پیاده‌سازی **رزومه‌ساز بومی پلتفرم** برای کارجو — ساختاریافته، بدون آپلود فایل — و اتصال به **JobApplication** (Phase 4).

### ۱.۱ محدوده (In Scope)

| حوزه | توضیح |
|------|--------|
| **Resume Builder** | یک رزومه فعال per user — CRUD بخش‌ها |
| **Education** | سوابق تحصیلی |
| **Experience** | سوابق کاری |
| **Skills** | مهارت‌ها — FK به Taxonomy `Skill` |
| **Technologies** | فناوری‌ها — FK به Taxonomy `Technology` |
| **Languages** | زبان‌ها + سطح تسلط |
| **Certificates** | گواهینامه‌ها |
| **Projects** | پروژه‌ها |
| **Candidate Resume Visibility** | PUBLIC / EMPLOYERS_ONLY / PRIVATE |
| **Application link** | `JobApplication.resumeId` → Resume |
| **Permissions** | `resume:*` RBAC |
| **Audit** | RESUME_* events |
| **completionScore** | امتیاز تکمیل رزومه (مشابه profile) |

### ۱.۲ خارج از محدوده (Out of Scope)

| قابلیت | فاز |
|--------|-----|
| آپلود PDF/DOCX | — (ممنوع دائمی در RFC) |
| AI پیشنهاد / بهینه‌سازی متن | 8 |
| Matching engine / ranking | 6 |
| Search رزومه | 6 |
| PDF export | 5+ (optional future) |
| چند رزومه per user | — |
| SSR `/resumes/*` pages | 12 |
| Resume parsing / OCR | — |
| Payments (premium templates) | 7 |

---

## ۲. قوانین محصول (CTO)

| # | Rule |
|---|------|
| R-1 | **یک رزومه فعال per user** — `userId` unique on `resumes` |
| R-2 | **بدون آپلود فایل** — فقط structured data |
| R-3 | **بدون AI** — هیچ endpoint یا service AI |
| R-4 | **بدون matching engine** — فقط CRUD + visibility |
| R-5 | فقط `JOB_SEEKER` (یا user با role job_seeker) |
| R-6 | Skills/Technologies از Taxonomy Phase 3 — بدون free-text skill entity |

---

## ۳. Resume Core

### ۳.۱ فیلدهای اصلی

| Field | Required | Notes |
|-------|----------|-------|
| title | optional | e.g. «رزومه توسعه‌دهنده بک‌اند» |
| summary | optional | bio/summary max 2000 chars |
| visibility | ✅ | default PRIVATE |
| completionScore | computed | 0–100 |

### ۳.۲ Candidate Resume Visibility

```text
PRIVATE          → فقط owner
EMPLOYERS_ONLY   → employer با permission هنگام مشاهده application یا profile
PUBLIC           → endpoint عمومی با slug کاربر (optional Phase 5 API)
```

| Visibility | Owner API | Employer (application) | Public API |
|------------|-----------|--------------------------|------------|
| PRIVATE | ✅ | ❌ (even on application) | ❌ |
| EMPLOYERS_ONLY | ✅ | ✅ when viewing own job's application | ❌ |
| PUBLIC | ✅ | ✅ | ✅ via `/users/by-slug/:slug/resume` |

**نکته:** employer فقط رزومه applicants روی jobs خودش را می‌بیند — نه browse عمومی.

---

## ۴. Sections

### ۴.۱ Education

| Field | Required |
|-------|----------|
| institution | ✅ |
| degree | optional |
| fieldOfStudy | optional |
| startDate | ✅ |
| endDate | optional if isCurrent |
| isCurrent | default false |
| description | optional |
| sortOrder | ✅ |

### ۴.۲ Experience

| Field | Required |
|-------|----------|
| companyName | ✅ |
| title | ✅ |
| employmentType | optional |
| cityId | optional FK Location |
| startDate | ✅ |
| endDate | optional if isCurrent |
| isCurrent | default false |
| description | optional |
| sortOrder | ✅ |

### ۴.۳ Skills

M2M `ResumeSkill`: `skillId` (FK Skill) + optional `proficiency` enum + `sortOrder`  
**Max:** 30 skills per resume

### ۴.۴ Technologies

M2M `ResumeTechnology`: `technologyId` (FK Technology) + optional `proficiency` + `sortOrder`  
**Max:** 30 technologies per resume

### ۴.۵ Languages

| Field | Required |
|-------|----------|
| languageCode | ✅ ISO 639-1 e.g. `fa`, `en` |
| languageName | ✅ display e.g. «فارسی» |
| proficiency | ✅ NATIVE, FLUENT, ADVANCED, INTERMEDIATE, BASIC |
| sortOrder | ✅ |

**Max:** 10 languages

### ۴.۶ Certificates

| Field | Required |
|-------|----------|
| name | ✅ |
| issuer | optional |
| issueDate | optional |
| expiryDate | optional |
| credentialId | optional |
| credentialUrl | optional URL |
| sortOrder | ✅ |

### ۴.۷ Projects

| Field | Required |
|-------|----------|
| title | ✅ |
| description | optional |
| url | optional |
| startDate | optional |
| endDate | optional |
| technologyIds | optional M2M Technology (max 10 per project) |
| sortOrder | ✅ |

---

## ۵. Application Integration

Phase 4 `JobApplication.resumeId` nullable → Phase 5:

| Rule | توضیح |
|------|--------|
| On apply | اگر user رزومه دارد → `resumeId` set automatically (optional override in body) |
| On apply without resume | allowed — `resumeId` null (backward compatible) |
| Employer view | application detail includes resume snapshot fields when `resumeId` set + visibility allows |
| Withdraw | resumeId unchanged on application record |

**No snapshot table Phase 5** — live FK to Resume; employer sees current resume at view time. Document as assumption A-3 (acceptable for MVP).

---

## ۶. completionScore

Weighted sections (suggested):

| Section | Weight |
|---------|--------|
| summary filled | 10 |
| ≥1 education | 15 |
| ≥1 experience | 25 |
| ≥3 skills | 20 |
| ≥1 language | 10 |
| ≥1 project or certificate | 10 |
| technologies ≥1 | 10 |

Cap 100. Recompute on any section mutation.

---

## ۷. Permissions (seed)

| Permission | Use |
|------------|-----|
| `resume:read:own` | GET own resume |
| `resume:update:own` | PATCH resume + sections |
| `resume:read:employer` | employer view applicant resume on own jobs |
| `resume:read:public` | public slug endpoint (anonymous) |

Role `job_seeker`: `resume:read:own`, `resume:update:own`  
Role `employer`: `resume:read:employer`  
Public route: no auth + `resume:read:public` at route level for PUBLIC visibility only

---

## ۸. Audit Events

- `RESUME_CREATED`, `RESUME_UPDATED`, `RESUME_VISIBILITY_CHANGED`
- `RESUME_EDUCATION_*`, `RESUME_EXPERIENCE_*`, `RESUME_SKILL_*`, `RESUME_TECHNOLOGY_*`
- `RESUME_LANGUAGE_*`, `RESUME_CERTIFICATE_*`, `RESUME_PROJECT_*`

---

## ۹. Module Structure

```text
src/modules/resumes/
  services/
    resume.service.ts
    resume-section.service.ts   # or split per section if needed
    completion-score.util.ts
  validators/
    resume.schema.ts
  README.md
```

Jobs module **minimal change** — wire `resumeId` on apply in `application.service.ts`.

Taxonomy module **read-only** — validate skillId/technologyId exist + active.

---

## ۱۰. Acceptance Gate

CTO تأیید spec → implementation on `main`.

---

## References

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_DESIGN.md](./API_DESIGN.md)
- [docs/rfc/resume-builder.md](../rfc/resume-builder.md)
- Phase 4 closed — `v0.5-phase-4`
