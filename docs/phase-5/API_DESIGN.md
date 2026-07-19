# API Design — Phase 5: Resume Builder

**Base URL:** `/api/v1`  
**فاز:** 5 — **Spec only**

---

## ۱. Job Seeker — Resume Core

**Auth:** Bearer · **Permission:** `resume:read:own` / `resume:update:own`

### GET `/users/me/resume`

Returns full resume with all sections, or `404 RESUME_NOT_FOUND` (lazy create on first PATCH optional — spec: auto-create empty resume on first GET or PATCH).

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "title": "رزومه توسعه‌دهنده",
    "summary": "...",
    "visibility": "PRIVATE",
    "completionScore": 65,
    "educations": [],
    "experiences": [],
    "skills": [{ "skillId": "uuid", "nameFa": "...", "proficiency": "ADVANCED" }],
    "technologies": [],
    "languages": [],
    "certificates": [],
    "projects": []
  }
}
```

### PATCH `/users/me/resume`

**Body:** `{ "title?", "summary?", "visibility?" }`  
**Audit:** `RESUME_UPDATED` / `RESUME_VISIBILITY_CHANGED`  
**Errors:** `RESUME_VISIBILITY_INVALID`

---

## ۲. Job Seeker — Sections

Base path: `/users/me/resume/...`  
All require `resume:update:own`. Resume auto-created if missing.

| Method | Path | Action |
|--------|------|--------|
| POST | `/educations` | create |
| PATCH | `/educations/:id` | update |
| DELETE | `/educations/:id` | delete |
| POST | `/experiences` | create |
| PATCH | `/experiences/:id` | update |
| DELETE | `/experiences/:id` | delete |
| PUT | `/skills` | replace full list (max 30) |
| PUT | `/technologies` | replace full list (max 30) |
| POST | `/languages` | create |
| PATCH | `/languages/:id` | update |
| DELETE | `/languages/:id` | delete |
| POST | `/certificates` | create |
| PATCH | `/certificates/:id` | update |
| DELETE | `/certificates/:id` | delete |
| POST | `/projects` | create |
| PATCH | `/projects/:id` | update |
| DELETE | `/projects/:id` | delete |

**Skills body example:**

```json
{
  "skills": [
    { "skillId": "uuid", "proficiency": "EXPERT", "sortOrder": 0 }
  ]
}
```

**Validation errors:** `SKILL_NOT_FOUND`, `TECHNOLOGY_NOT_FOUND`, `RESUME_SECTION_LIMIT_EXCEEDED`, `INVALID_DATE_RANGE`

Each mutation triggers `completionScore` recompute.

---

## ۳. Public — Resume by User Slug

### GET `/users/by-slug/:slug/resume`

**Auth:** none  
**Condition:** user has resume + `visibility=PUBLIC` + user ACTIVE  
**Permission at route:** public read when visibility PUBLIC  
**Errors:** `RESUME_NOT_FOUND`, `RESUME_NOT_PUBLIC`

Response: same shape as GET `/users/me/resume` minus internal audit fields.

---

## ۴. Employer — Applicant Resume

### GET `/jobs/:id/applications/:applicationId/resume`

**Auth:** Bearer · company member of job's company  
**Permission:** `resume:read:employer`  
**Condition:** application belongs to job; resume visibility `EMPLOYERS_ONLY` or `PUBLIC`; `resumeId` not null  
**Errors:** `APPLICATION_NOT_FOUND`, `RESUME_NOT_ACCESSIBLE`

Alternative: embed resume in existing `GET /jobs/:id/applications/:applicationId` when allowed — spec prefers dedicated sub-resource for clarity.

---

## ۵. Application — Resume Link (Phase 4 extension)

### POST `/jobs/:id/applications`

**Extended body:**

```json
{
  "coverLetter": "...",
  "resumeId": "uuid"
}
```

| Rule | Behavior |
|------|----------|
| `resumeId` omitted | auto-set user's resume if exists |
| `resumeId` provided | must belong to authenticated user |
| invalid resume | `RESUME_NOT_FOUND` |
| user has no resume | `resumeId` null — apply still allowed |

---

## ۶. Admin

No admin resume moderation Phase 5. Future: report/abuse workflow.

---

## ۷. Error Codes (new)

| Code | HTTP |
|------|------|
| `RESUME_NOT_FOUND` | 404 |
| `RESUME_NOT_PUBLIC` | 404 |
| `RESUME_NOT_ACCESSIBLE` | 403 |
| `RESUME_SECTION_LIMIT_EXCEEDED` | 400 |
| `RESUME_VISIBILITY_INVALID` | 400 |
| `INVALID_DATE_RANGE` | 400 |

---

## ۸. Out of Scope Endpoints

- POST `/resumes/upload` — **forbidden**
- GET `/resumes/search` — Phase 6
- POST `/resumes/ai-suggest` — Phase 8
- GET `/resumes/match/:jobId` — Phase 6
