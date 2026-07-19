# طراحی API — Phase 0

**پروژه:** ComputerJobs.ir  
**Base URL:** `/api/v1`  
**نسخه:** 0.1.0

---

## ۱. قراردادهای عمومی

### ۱.۱ URL Structure

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{action}
```

**قوانین:**
- kebab-case برای URL segments
- versioning در path: `/api/v1/`
- plural nouns برای resources: `/jobs`, `/users`

### ۱.۲ HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Read (list or single) |
| POST | Create |
| PUT | Full update |
| PATCH | Partial update |
| DELETE | Soft delete |

### ۱.۳ Response Envelope

همه پاسخ‌ها از این ساختار پیروی می‌کنند:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-07-18T10:00:00.000Z",
    "requestId": "uuid-correlation-id"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "توضیح خطا به فارسی",
    "details": [ ... ]
  },
  "meta": {
    "timestamp": "2026-07-18T10:00:00.000Z",
    "requestId": "uuid-correlation-id"
  }
}
```

---

## ۲. Error Codes

| Code | HTTP Status | توضیح |
|------|-------------|-------|
| `VALIDATION_ERROR` | 400 | ورودی نامعتبر |
| `UNAUTHORIZED` | 401 | احراز هویت نشده |
| `FORBIDDEN` | 403 | دسترسی مجاز نیست |
| `NOT_FOUND` | 404 | منبع یافت نشد |
| `CONFLICT` | 409 | تداخل داده |
| `RATE_LIMITED` | 429 | محدودیت درخواست |
| `INTERNAL_ERROR` | 500 | خطای سرور |
| `SERVICE_UNAVAILABLE` | 503 | سرویس در دسترس نیست |

---

## ۳. Pagination

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 150,
      "totalPages": 8
    }
  }
}
```

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- `sortBy` (field name)
- `sortOrder` (`asc` | `desc`)

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Page-Size: 20
```

---

## ۴. Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1721289600
```

(پیاده‌سازی کامل در Phase 13)

---

## ۵. Authentication (Phase 1 — Spec Only)

```
Authorization: Bearer <access_token>
```

- Access Token: JWT, 15 min TTL
- Refresh Token: opaque, 7 day TTL, httpOnly cookie
- RBAC: role-based permissions per endpoint

---

## ۶. Phase 0 Endpoints

### ۶.۱ Liveness Check

```
GET /api/v1/health
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "0.1.0",
    "uptime": 3600
  },
  "error": null,
  "meta": {
    "timestamp": "2026-07-18T10:00:00.000Z",
    "requestId": "abc-123"
  }
}
```

### ۶.۲ Readiness Check (Deep Health)

```
GET /api/v1/health/deep
```

**Response 200 (همه سرویس‌ها healthy):**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "checks": {
      "database": { "status": "ok", "latencyMs": 5 },
      "redis": { "status": "ok", "latencyMs": 2 }
    }
  },
  "error": null,
  "meta": { ... }
}
```

**Response 503 (یک یا چند سرویس unhealthy):**

```json
{
  "success": false,
  "data": {
    "status": "degraded",
    "checks": {
      "database": { "status": "ok", "latencyMs": 5 },
      "redis": { "status": "error", "latencyMs": null, "message": "Connection refused" }
    }
  },
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "برخی سرویس‌ها در دسترس نیستند"
  },
  "meta": { ... }
}
```

---

## ۷. Future Endpoints (Roadmap)

| Phase | Endpoints |
|-------|-----------|
| 1 | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| 2 | `/provinces`, `/cities`, `/provinces/:slug/cities` |
| 3 | `/categories`, `/subcategories`, `/skills`, `/technologies` |
| 4 | `/jobs`, `/jobs/:slug`, `/companies` |
| 5 | `/resumes`, `/resumes/:id/sections` |
| 6 | `/search/jobs`, `/applications` |
| 7 | `/ai/chat`, `/ai/analyze-resume`, `/ai/match` |
| 9 | `/plans`, `/subscriptions`, `/payments` |
| 10 | `/notifications` |
| 11 | `/ads` |

---

## ۸. Content-Type

- Request: `application/json`
- Response: `application/json; charset=utf-8`

---

## ۹. CORS (Production)

```
Access-Control-Allow-Origin: https://computerjobs.ir
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## ۱۰. مراجع

- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
