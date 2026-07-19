# API Design — Phase 2: Profiles & Companies

**Base URL:** `/api/v1`  
**فاز:** 2 — **Spec only**

Envelope & errors: [Phase 0 API_DESIGN.md](../phase-0/API_DESIGN.md)  
Auth: JWT Bearer (Phase 1)

---

## ۱. Profiles — Job Seeker

### GET `/users/me/job-seeker-profile`

**Auth:** JOB_SEEKER, ACTIVE  
**Permission:** `profile:read:own`

**Success:** `200` — full profile + `completionScore`

---

### PATCH `/users/me/job-seeker-profile`

**Body (partial):**

```json
{
  "displayName": "علی رضایی",
  "headline": "توسعه‌دهنده Backend",
  "bio": "...",
  "avatarUrl": "https://...",
  "cityLabel": "تهران",
  "profileVisibility": "PUBLIC"
}
```

**Success:** `200`  
**Errors:** `VALIDATION_ERROR`, `FORBIDDEN`, `USER_NOT_ACTIVE`

---

## ۲. Profiles — Employer

### GET `/users/me/employer-profile`

**Auth:** EMPLOYER

### PATCH `/users/me/employer-profile`

**Body:**

```json
{
  "displayName": "سارا احمدی",
  "jobTitle": "مدیر منابع انسانی",
  "bio": "..."
}
```

---

## ۳. Companies — Owner/Admin

### POST `/companies`

**Auth:** EMPLOYER (no existing company or policy allows multiple — **one primary company Phase 2**)

**Body:**

```json
{
  "name": "شرکت فناوری آریا",
  "slug": "arya-tech",
  "description": "...",
  "websiteUrl": "https://arya.ir",
  "employeeCountRange": "SIZE_11_50",
  "industryLabel": "نرم‌افزار"
}
```

**Success:** `201` — creates Company + OWNER member + links employerProfile.companyId

**Errors:** `SLUG_TAKEN`, `COMPANY_ALREADY_EXISTS`

---

### GET `/companies/mine`

List companies where user is member.

---

### GET `/companies/:id`

**Auth:** member or admin  
**Permission:** `company:read:own` or admin

---

### PATCH `/companies/:id`

**Permission:** OWNER or ADMIN + `company:update:own`

---

### DELETE `/companies/:id`

Soft delete. **OWNER only.**

---

## ۴. Public Company

### GET `/companies/by-slug/:slug`

**Auth:** none  
**Returns:** public fields only if company VERIFIED + not deleted  
**Errors:** `NOT_FOUND` (also for unverified — no enumeration)

---

## ۵. Members

### GET `/companies/:id/members`

**Auth:** company member

### DELETE `/companies/:id/members/:userId`

**Auth:** OWNER/ADMIN — cannot remove OWNER  
**Permission:** `company:members:manage`

### PATCH `/companies/:id/members/:userId`

Change role (not OWNER). **OWNER only.**

---

## ۶. Invites

### POST `/companies/:id/invites`

**Body:**

```json
{
  "email": "colleague@example.com",
  "role": "MEMBER"
}
```

**Success:** `201` — email stub queued  
**Errors:** `INVITE_ALREADY_PENDING`, `MEMBER_ALREADY_EXISTS`

---

### POST `/companies/invites/accept`

**Body:**

```json
{
  "token": "plain-token-from-email"
}
```

**Auth:** logged-in user, email must match invite

---

### DELETE `/companies/:id/invites/:inviteId`

Revoke pending invite.

---

## ۷. Ownership

### POST `/companies/:id/transfer-ownership`

**Body:** `{ "newOwnerUserId": "uuid" }`  
**Auth:** current OWNER only

---

## ۸. Admin (stub)

### PATCH `/admin/companies/:id/verification`

**Auth:** ADMIN/SUPER_ADMIN + `company:verify`

**Body:** `{ "status": "VERIFIED" | "REJECTED", "reason": "..." }`

---

## ۹. Extended GET `/users/me`

Include nested profile summary by `primaryType`:

```json
{
  "id": "...",
  "primaryType": "EMPLOYER",
  "jobSeekerProfile": null,
  "employerProfile": { "companyId": "...", "verificationStatus": "PENDING_REVIEW" }
}
```

---

## ۱۰. Error codes (new)

| Code | HTTP |
|------|------|
| SLUG_TAKEN | 409 |
| COMPANY_ALREADY_EXISTS | 409 |
| NOT_COMPANY_MEMBER | 403 |
| INVITE_EXPIRED | 400 |
| INVITE_ALREADY_PENDING | 409 |
| CANNOT_REMOVE_OWNER | 400 |
