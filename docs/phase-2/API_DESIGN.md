# API Design — Phase 2: Profiles & Companies

**Base URL:** `/api/v1`  
**فاز:** 2 — **Approved spec — implementation on `main`**

---

## ۱. User Slug

### PATCH `/users/me/slug`

**Body:** `{ "slug": "ali-rezaei" }`  
**Auth:** ACTIVE user  
**Errors:** `SLUG_TAKEN`, `SLUG_RESERVED`, `VALIDATION_ERROR`

Auto-generate from displayName if omitted on first profile save.

---

### GET `/profiles/by-slug/:slug` (public)

**Auth:** none (respects profileVisibility + user ACTIVE)  
**Future SEO:** `/profiles/{slug}`

Returns job-seeker or employer public profile summary + `user.slug`.

---

## ۲. Job Seeker Profile

### GET `/users/me/job-seeker-profile`

### PATCH `/users/me/job-seeker-profile`

**Body (partial):**

```json
{
  "displayName": "علی رضایی",
  "slug": "ali-rezaei",
  "headline": "توسعه‌دهنده Backend",
  "bio": "...",
  "avatarUrl": "https://cdn.example/avatar.jpg",
  "cityLabel": "تهران",
  "profileVisibility": "PUBLIC"
}
```

> **avatarUrl:** external URL only — **no upload endpoint Phase 2**

**Audit:** `PROFILE_UPDATED`

---

## ۳. Employer Profile

### GET/PATCH `/users/me/employer-profile`

**verificationStatus** read-only for employer; admin changes via §۹.

---

## ۴. Companies

### POST `/companies`

```json
{
  "name": "شرکت فناوری آریا",
  "slug": "arya-tech",
  "logoUrl": "https://cdn.example/logo.png",
  "industryLabel": "نرم‌افزار",
  "employeeCountRange": "SIZE_11_50"
}
```

> **logoUrl:** URL only — no upload

**Defaults:** `verificationStatus=PENDING`, `status=ACTIVE`  
**Audit:** `COMPANY_CREATED`

---

### GET `/companies/by-slug/:slug` (public)

Visible only if:
- `verificationStatus=VERIFIED`
- `status=ACTIVE`
- `deletedAt IS NULL`

---

### PATCH `/companies/:id`

**Audit:** `COMPANY_UPDATED`

### DELETE `/companies/:id`

Sets `status=DELETED`, `deletedAt=now()`  
**Audit:** `COMPANY_DELETED`

---

## ۵. Members & Invites

| Action | Audit |
|--------|-------|
| POST `/companies/:id/invites` | MEMBER_INVITED |
| POST `/companies/invites/accept` | MEMBER_ACCEPTED |
| DELETE `/companies/:id/members/:userId` | MEMBER_REMOVED |
| POST `/companies/:id/transfer-ownership` | OWNERSHIP_TRANSFERRED |

---

## ۶. Admin

### PATCH `/admin/employers/:userId/verification`

**Body:** `{ "status": "UNDER_REVIEW" | "VERIFIED" | "REJECTED" }`  
Workflow: PENDING → UNDER_REVIEW → VERIFIED | REJECTED

### PATCH `/admin/companies/:id/verification`

Same enum for company verification.

### PATCH `/admin/companies/:id/status`

**Body:** `{ "status": "ACTIVE" | "SUSPENDED" | "DELETED" }`  
**Audit:** `COMPANY_STATUS_CHANGED`

---

## ۷. Extended GET `/users/me`

Include `slug`, nested profile, verification statuses.

---

## ۸. Error codes (new)

| Code | HTTP |
|------|------|
| SLUG_TAKEN | 409 |
| SLUG_RESERVED | 400 |
| COMPANY_SUSPENDED | 403 |
| COMPANY_NOT_VERIFIED | 404 (public) |
| USER_SLUG_REQUIRED | 400 (public profile without slug) |

---

## ۹. Out of Scope

- POST `/upload/avatar` — **not in Phase 2**
- POST `/upload/logo` — **not in Phase 2**
