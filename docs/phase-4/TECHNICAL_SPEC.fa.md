# مشخصات فنی — Phase 4: Jobs Core

**پروژه:** ComputerJobs.ir  
**نسخه:** 4.0.0-spec  
**فاز:** 4  
**وضعیت:** ⏳ **در انتظار تأیید CTO** — **بدون پیاده‌سازی کد**

---

## ۱. هدف Phase 4

پیاده‌سازی **هسته آگهی شغل (Jobs)** و **پایه درخواست (Application Foundation)** روی زیرساخت IAM، Company، Location و Taxonomy.

### ۱.۱ محدوده (In Scope)

| حوزه | توضیح |
|------|--------|
| **Jobs Core** | CRUD آگهی توسط کارفرما (شرکت verified + active) |
| **Job Lifecycle** | DRAFT → PUBLISHED → PAUSED / CLOSED / EXPIRED |
| **Job Slug** | slug یکتا — URL آینده `/jobs/{slug}` |
| **Relations** | companyId, cityId, categoryId, subCategoryId, skills[] |
| **Public APIs** | لیست + جزئیات آگهی منتشرشده |
| **Basic Filtering** | province/city, category, company, employmentType |
| **Application Foundation** | ثبت درخواست کارجو — بدون Resume Builder |
| **Permissions** | `job:*` RBAC |
| **Audit** | JOB_*, APPLICATION_* |

### ۱.۲ خارج از محدوده (Out of Scope)

| قابلیت | فاز |
|--------|-----|
| Resume Builder / آپلود رزومه | 5 |
| AI Matching / ranking | 6 |
| Payments / paid job posts | 7 |
| Advertisements | جدا |
| Skill/technology programmatic SEO filters | 6 |
| SSR `/jobs/*` pages | 12 |
| Admin job moderation UI کامل | admin phase |
| Notifications on apply | notifications phase |

---

## ۲. Job Lifecycle

```text
DRAFT
  ↓ publish (employer)
PUBLISHED
  ↓ pause / close / expire
PAUSED | CLOSED | EXPIRED
```

| Status | Public API | Employer edit |
|--------|------------|---------------|
| DRAFT | 404 | ✅ |
| PUBLISHED | ✅ | limited (pause/close) |
| PAUSED | 404 | ✅ resume → PUBLISHED |
| CLOSED | 404 (or read-only archive — spec: 404 public) | read-only |
| EXPIRED | 404 | read-only |

**قوانین:**
- فقط شرکت `VERIFIED` + `ACTIVE` می‌تواند publish کند
- `expiresAt` اجباری on publish (default 30 روز)
- soft delete → `status=DELETED` + `deletedAt`

---

## ۳. Job Slug

| قانون | توضیح |
|-------|--------|
| unique | globally among non-deleted jobs |
| format | URL-safe — reuse `slug.util.ts` |
| SEO | `/jobs/{slug}` per SEO_STRATEGY |
| generate | از title + suffix در صورت تکراری |

---

## ۴. Job Fields (summary)

| Field | Required | Notes |
|-------|----------|-------|
| title | ✅ | max 200 |
| description | ✅ | plain text / markdown subset — plain Phase 4 |
| companyId | ✅ | از membership employer |
| cityId | ✅ | FK Location Phase 3 |
| categoryId | ✅ | FK Taxonomy |
| subCategoryId | optional | |
| employmentType | ✅ | FULL_TIME, PART_TIME, CONTRACT, REMOTE, HYBRID |
| experienceLevel | optional | JUNIOR, MID, SENIOR, LEAD |
| salaryMin/Max | optional | showSalary flag |
| skills | optional | M2M JobSkill — max 10 |
| expiresAt | on publish | |

---

## ۵. Basic Filtering (Public list)

Query params on `GET /jobs`:

| Filter | Type |
|--------|------|
| `provinceSlug` | resolves cities in province |
| `citySlug` | exact city |
| `categorySlug` | category |
| `subCategorySlug` | subcategory |
| `companySlug` | company (verified only) |
| `employmentType` | enum |
| `page`, `limit` | pagination |

فقط `status=PUBLISHED`, `deletedAt IS NULL`, `expiresAt > now()`.

---

## ۶. Application Foundation

**هدف:** schema + API حداقلی — **بدون Resume Builder**.

| Field | Notes |
|-------|-------|
| jobId, userId | unique per active application |
| status | SUBMITTED, WITHDRAWN, REJECTED, SHORTLISTED (employer) |
| coverLetter | optional text max 2000 |
| resumeId | **null Phase 4** — FK Phase 5 |

**APIs:**
- Job seeker: `POST /jobs/:id/applications`, `GET /users/me/applications`
- Employer: `GET /jobs/:id/applications`, `PATCH .../applications/:id/status`

**Out of scope:** file upload, resume parsing, AI score.

---

## ۷. Permissions (seed)

| Permission | Use |
|------------|-----|
| `job:create` | POST job |
| `job:read:own` | employer own jobs |
| `job:update:own` | edit draft / lifecycle |
| `job:read` | public list (anonymous OK at route level) |
| `job:apply` | submit application |
| `job:applications:read:own` | employer view applications |
| `job:applications:manage:own` | employer status change |

---

## ۸. Audit Events

- `JOB_CREATED`, `JOB_UPDATED`, `JOB_PUBLISHED`, `JOB_PAUSED`, `JOB_CLOSED`, `JOB_DELETED`
- `APPLICATION_SUBMITTED`, `APPLICATION_WITHDRAWN`, `APPLICATION_STATUS_CHANGED`

---

## ۹. Module Structure

```text
src/modules/jobs/
  services/
    job.service.ts
    application.service.ts
  validators/
    job.schema.ts
  README.md
```

Companies module **unchanged** — jobs module جدا (no God Module).

---

## ۱۰. Acceptance Gate

CTO تأیید spec → implementation on `main`.

---

## References

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_DESIGN.md](./API_DESIGN.md)
- [SEO_STRATEGY.md](../SEO_STRATEGY.md)
- Phase 3 closed — `v0.4-phase-3`
