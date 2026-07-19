# API Design — Phase 4: Jobs Core

**Base URL:** `/api/v1`  
**فاز:** 4 — **Spec only**

---

## ۱. Public — Jobs

### GET `/jobs`

**Auth:** none  
**Query:** `provinceSlug`, `citySlug`, `categorySlug`, `subCategorySlug`, `companySlug`, `employmentType`, `page`, `limit`

**Response:** paginated list — public fields only (no internal IDs in slug URLs; IDs OK in JSON API).

```json
{
  "data": [
    {
      "slug": "senior-backend-tehran-acme",
      "title": "Senior Backend Developer",
      "company": { "slug": "acme", "name": "..." },
      "city": { "slug": "tehran", "nameFa": "تهران" },
      "category": { "slug": "software-development", "nameFa": "..." },
      "employmentType": "FULL_TIME",
      "publishedAt": "2026-07-19T12:00:00Z",
      "expiresAt": "2026-08-18T12:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```

### GET `/jobs/by-slug/:slug`

**Auth:** none  
**Condition:** `PUBLISHED`, not expired, company verified + active  
**Errors:** `JOB_NOT_FOUND`

---

## ۲. Employer — Jobs

**Auth:** Bearer + company membership  
**Permissions:** see TECHNICAL_SPEC §۷

### POST `/jobs`

**Permission:** `job:create`  
**Body:**

```json
{
  "title": "Senior Backend Developer",
  "description": "...",
  "cityId": "uuid",
  "categoryId": "uuid",
  "subCategoryId": "uuid",
  "employmentType": "FULL_TIME",
  "experienceLevel": "SENIOR",
  "skillIds": ["uuid"],
  "salaryMin": 50000000,
  "salaryMax": 80000000,
  "showSalary": false
}
```

**Defaults:** `status=DRAFT`, slug auto-generated  
**Audit:** `JOB_CREATED`

### GET `/jobs/mine`

**Permission:** `job:read:own`  
**Query:** `status`, `companyId`, `page`

### GET `/jobs/:id`

**Permission:** `job:read:own` — employer member of job's company

### PATCH `/jobs/:id`

**Permission:** `job:update:own`  
**Rule:** only `DRAFT` or `PAUSED` fully editable; `PUBLISHED` limited fields (spec: description typo fix only — or pause/close via actions)  
**Audit:** `JOB_UPDATED`

### POST `/jobs/:id/publish`

**Permission:** `job:update:own`  
**Body:** `{ "expiresAt": "ISO8601" }` optional — default +30 days  
**Preconditions:** company VERIFIED + ACTIVE, required fields set  
**Audit:** `JOB_PUBLISHED`

### POST `/jobs/:id/pause`

**Audit:** `JOB_PAUSED`

### POST `/jobs/:id/close`

**Audit:** `JOB_CLOSED`

### DELETE `/jobs/:id`

Soft delete — **Audit:** `JOB_DELETED`

---

## ۳. Applications

### POST `/jobs/:id/applications`

**Auth:** job seeker ACTIVE  
**Permission:** `job:apply`  
**Body:** `{ "coverLetter": "..." }`  
**Preconditions:** job PUBLISHED, not expired, no duplicate application  
**Audit:** `APPLICATION_SUBMITTED`  
**Errors:** `JOB_NOT_ACCEPTING`, `ALREADY_APPLIED`

### POST `/jobs/:id/applications/withdraw`

**Permission:** `job:apply` (own application)  
**Audit:** `APPLICATION_WITHDRAWN`

### GET `/users/me/applications`

**Auth:** job seeker  
**Permission:** `job:apply`

### GET `/jobs/:id/applications`

**Auth:** employer company member  
**Permission:** `job:applications:read:own`

### PATCH `/jobs/:id/applications/:applicationId`

**Permission:** `job:applications:manage:own`  
**Body:** `{ "status": "SHORTLISTED" | "REJECTED" | "HIRED" }`  
**Audit:** `APPLICATION_STATUS_CHANGED`

---

## ۴. Error Codes

| Code | HTTP |
|------|------|
| `JOB_NOT_FOUND` | 404 |
| `JOB_NOT_ACCEPTING` | 409 |
| `ALREADY_APPLIED` | 409 |
| `COMPANY_NOT_VERIFIED` | 403 |
| `INVALID_JOB_STATE` | 409 |
| `APPLICATION_NOT_FOUND` | 404 |

---

## ۵. Out of Scope Routes

- `/resumes/*` — Phase 5
- `/jobs/match` — Phase 6
- `/payments/*` — Phase 7
- `/ads/*` — separate
