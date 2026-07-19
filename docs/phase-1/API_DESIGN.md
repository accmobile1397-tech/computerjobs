# API Design — Phase 1: IAM

**Base URL:** `/api/v1`  
**فاز:** 1 — **Spec only**

قرارداد envelope، error codes عمومی: [Phase 0 API_DESIGN.md](../phase-0/API_DESIGN.md)

---

## ۱. Auth Endpoints (Public)

### POST `/auth/register/job-seeker`

ثبت‌نام کارجو.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "علی رضایی"
}
```

**Validation:**
- email: valid, normalized lowercase
- password: min 8, 1 upper, 1 lower, 1 digit
- displayName: optional, max 120

**Success:** `201`

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "status": "PENDING",
    "message": "ایمیل تأیید ارسال شد"
  }
}
```

**Errors:** `VALIDATION_ERROR`, `EMAIL_ALREADY_EXISTS`

---

### POST `/auth/register/employer`

مشابه job-seeker — `primaryType: EMPLOYER`, profile employer.

---

### POST `/auth/login`

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success:** `200`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "primaryType": "JOB_SEEKER",
      "status": "ACTIVE",
      "emailVerified": true,
      "roles": ["job_seeker"],
      "permissions": ["users:read:self", "resumes:create"]
    }
  }
}
```

**Set-Cookie:** `refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`

**Errors:**

| Code | HTTP |
|------|------|
| `INVALID_CREDENTIALS` | 401 |
| `EMAIL_NOT_VERIFIED` | 403 |
| `ACCOUNT_LOCKED` | 403 |
| `ACCOUNT_SUSPENDED` | 403 |
| `ACCOUNT_BANNED` | 403 |

---

### POST `/auth/refresh`

**Input:** refresh token (cookie preferred, or body `{ "refreshToken": "..." }`)

**Success:** `200` — new accessToken + rotated refresh cookie

**Errors:** `TOKEN_EXPIRED`, `TOKEN_INVALID`, `UNAUTHORIZED`

---

### POST `/auth/logout`

**Auth:** Bearer access token + refresh cookie

**Success:** `200` — revoke current refresh token

---

### POST `/auth/logout-all`

**Auth:** Bearer access token

**Success:** `200` — revoke all refresh tokens for user

---

### POST `/auth/forgot-password`

**Body:** `{ "email": "..." }`

**Success:** `200` — always (anti-enumeration)

```json
{
  "success": true,
  "data": { "message": "اگر ایمیل موجود باشد، لینک ارسال می‌شود" }
}
```

---

### POST `/auth/reset-password`

**Body:**

```json
{
  "token": "plain-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Success:** `200`

**Errors:** `TOKEN_INVALID`, `TOKEN_EXPIRED`, `VALIDATION_ERROR`

---

### GET `/auth/verify-email`

**Query:** `?token=...`

**Success:** `200` — redirect یا JSON confirmation

**Side effect:** status → ACTIVE, emailVerified → true

---

### POST `/auth/resend-verification`

**Body:** `{ "email": "..." }`

**Rate limit:** 3/hour per email

**Success:** `200`

---

## ۲. Session Endpoints (Authenticated)

### GET `/auth/sessions`

**Auth:** Bearer + permission `users:read:self`

**Success:** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "createdAt": "...",
      "userAgent": "...",
      "ipAddress": "...",
      "current": true
    }
  ]
}
```

---

### DELETE `/auth/sessions/:sessionId`

Revoke specific refresh token / session.

**Auth:** Bearer — own sessions only

**Success:** `204`

---

## ۳. User Endpoints (Authenticated)

### GET `/users/me`

**Auth:** Bearer

**Success:** `200` — full user + profile + roles + permissions

---

### PATCH `/users/me`

**Auth:** Bearer + `users:update:self`

**Body (partial):**

```json
{
  "displayName": "نام جدید",
  "phone": "+989121234567"
}
```

**Note:** email change → separate flow Phase 1.5 (not in scope)

---

### PATCH `/users/me/password`

**Auth:** Bearer + `users:update:self`

**Body:**

```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

**Side effect:** revoke all refresh tokens except current (optional policy)

---

## ۴. Admin Endpoints (Phase 1 minimal)

**Prefix:** `/admin/users`  
**Auth:** Bearer + admin permissions

### GET `/admin/users`

**Permission:** `admin:users:read`  
Pagination: page, pageSize, filter by status, primaryType

---

### PATCH `/admin/users/:id/status`

**Permission:** `admin:users:suspend`

**Body:**

```json
{
  "status": "SUSPENDED",
  "reason": "..."
}
```

**Audit:** USER_SUSPENDED / USER_BANNED

---

### GET `/admin/roles`

**Permission:** `admin:roles:manage`

---

### POST `/admin/users/:id/roles`

**Permission:** `admin:roles:manage`

**Body:** `{ "roleId": "uuid" }`

---

## ۵. Authorization Header

```
Authorization: Bearer <accessToken>
```

---

## ۶. JWT Access Token Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "primaryType": "JOB_SEEKER",
  "roles": ["job_seeker"],
  "permissions": ["users:read:self"],
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Note:** permissions در token برای performance — revalidate on refresh. Admin role change → force refresh/logout.

---

## ۷. Rate Limiting (Phase 1 skeleton)

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 10/min per IP |
| POST /auth/register/* | 5/hour per IP |
| POST /auth/forgot-password | 3/hour per email |
| POST /auth/resend-verification | 3/hour per email |

Headers: `X-RateLimit-*` per Phase 0 convention.

---

## ۸. Module Mapping

| Route file | Service module |
|------------|----------------|
| `app/api/v1/auth/**` | `modules/auth/services/*` |
| `app/api/v1/users/**` | `modules/users/services/*` |
| `app/api/v1/admin/users/**` | `modules/users/services/admin/*` |

---

## ۹. Error Codes (IAM-specific)

| Code | HTTP |
|------|------|
| `INVALID_CREDENTIALS` | 401 |
| `EMAIL_NOT_VERIFIED` | 403 |
| `ACCOUNT_LOCKED` | 403 |
| `ACCOUNT_SUSPENDED` | 403 |
| `ACCOUNT_BANNED` | 403 |
| `TOKEN_EXPIRED` | 401 |
| `TOKEN_INVALID` | 401 |
| `PERMISSION_DENIED` | 403 |
| `EMAIL_ALREADY_EXISTS` | 409 |

---

## ۱۰. References

- [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- `.cto/SECURITY_RULES.md`
