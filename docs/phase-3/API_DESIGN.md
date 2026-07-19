# API Design — Phase 3: Location & Taxonomy

**Base URL:** `/api/v1`  
**فاز:** 3 — **Spec only — no implementation yet**

---

## ۱. Public — Location (read-only)

### GET `/locations/provinces`

**Auth:** none  
**Query:** `?active=true` (default true)

```json
{
  "data": [
    { "slug": "tehran", "nameFa": "تهران", "nameEn": "Tehran" }
  ]
}
```

### GET `/locations/provinces/:slug`

Single province + city count.

### GET `/locations/provinces/:slug/cities`

**Query:** `?active=true`

```json
{
  "data": [
    { "slug": "tehran", "nameFa": "تهران", "provinceSlug": "tehran" }
  ]
}
```

**Errors:** `NOT_FOUND` (inactive or missing slug)

---

## ۲. Public — Taxonomy (read-only)

### GET `/taxonomy/categories`

Active, non-deleted categories sorted by `sortOrder`.

### GET `/taxonomy/categories/:slug`

Category detail + subcategory count.

### GET `/taxonomy/categories/:slug/subcategories`

### GET `/taxonomy/subcategories/:slug/skills`

### GET `/taxonomy/skills/:slug`

Skill detail + technologies list.

### GET `/taxonomy/skills/:slug/technologies`

### GET `/taxonomy/technologies/:slug`

**SEO note:** mirrors `docs/SEO_STRATEGY.md` URL patterns (UI Phase 12).

---

## ۳. Admin — Location

**Auth:** ADMIN / SUPER_ADMIN + `location:read` | `location:write`

### GET `/admin/locations/provinces`

Include inactive.

### PATCH `/admin/locations/provinces/:id`

**Body:** `{ "isActive": false, "sortOrder": 10 }`  
**Audit:** `PROVINCE_UPDATED`

### PATCH `/admin/locations/cities/:id`

**Audit:** `CITY_UPDATED`

> Full CRUD for provinces/cities **not required** if seed is source of truth — admin enable/disable + sort only for MVP.

---

## ۴. Admin — Taxonomy CRUD

**Auth:** `taxonomy:read` | `taxonomy:write`

| Method | Path | Audit |
|--------|------|-------|
| POST | `/admin/taxonomy/categories` | `CATEGORY_CREATED` |
| PATCH | `/admin/taxonomy/categories/:id` | `CATEGORY_UPDATED` |
| DELETE | `/admin/taxonomy/categories/:id` | `CATEGORY_DELETED` (soft) |
| POST | `/admin/taxonomy/subcategories` | `SUBCATEGORY_CREATED` |
| PATCH | `/admin/taxonomy/subcategories/:id` | `SUBCATEGORY_UPDATED` |
| DELETE | `/admin/taxonomy/subcategories/:id` | `SUBCATEGORY_DELETED` |
| POST | `/admin/taxonomy/skills` | `SKILL_CREATED` |
| PATCH | `/admin/taxonomy/skills/:id` | `SKILL_UPDATED` |
| DELETE | `/admin/taxonomy/skills/:id` | `SKILL_DELETED` |
| POST | `/admin/taxonomy/technologies` | `TECHNOLOGY_CREATED` |
| PATCH | `/admin/taxonomy/technologies/:id` | `TECHNOLOGY_UPDATED` |
| DELETE | `/admin/taxonomy/technologies/:id` | `TECHNOLOGY_DELETED` |

**Validation:** slug unique per scope; reserved slugs blocked (reuse `slug.util.ts`).

---

## ۵. AI Suggestion + Approval

### POST `/admin/taxonomy/suggestions`

**Auth:** `taxonomy:write`  
**Body:**

```json
{
  "entityType": "SKILL",
  "proposedNameFa": "TypeScript",
  "proposedNameEn": "TypeScript",
  "proposedSlug": "typescript",
  "parentId": "<subCategoryId>",
  "source": "AI",
  "aiMetadata": { "model": "stub-v1" }
}
```

**Audit:** `TAXONOMY_SUGGESTION_CREATED`  
**Rule:** creates row with `status=PENDING` only — **never publishes**

### GET `/admin/taxonomy/suggestions`

**Query:** `?status=PENDING&entityType=SKILL&page=1&limit=20`

### POST `/admin/taxonomy/suggestions/:id/approve`

**Auth:** `taxonomy:approve`  
**Effect:** create published entity + set suggestion APPROVED  
**Audit:** `TAXONOMY_SUGGESTION_APPROVED`

### POST `/admin/taxonomy/suggestions/:id/reject`

**Body:** `{ "reviewNote": "duplicate" }`  
**Audit:** `TAXONOMY_SUGGESTION_REJECTED`

### POST `/admin/taxonomy/suggestions/:id/merge`

**Body:** `{ "mergedIntoId": "<existingEntityId>", "reviewNote": "..." }`  
**Audit:** `TAXONOMY_SUGGESTION_MERGED`

**Errors:** `SUGGESTION_NOT_PENDING`, `SLUG_TAKEN`, `PARENT_NOT_FOUND`, `MERGE_TARGET_INVALID`

---

## ۶. Phase 2 Profile/Company Updates

### PATCH `/users/me/job-seeker-profile`

**Add:** `cityId` (optional UUID) — replaces reliance on `cityLabel` when set  
**Keep:** `cityLabel` read-only deprecated or writable for backward compat until backfill complete

### PATCH `/companies/:id`

**Add:** `categoryId` (optional UUID)  
**Deprecate:** `industryLabel` in response when `categoryId` set (include resolved category summary)

---

## ۷. Permissions (seed)

| Permission | Description |
|------------|-------------|
| `location:read` | Public + admin read |
| `location:write` | Admin location updates |
| `taxonomy:read` | Public + admin read |
| `taxonomy:write` | CRUD + create suggestions |
| `taxonomy:approve` | Approve/reject/merge suggestions |

Assign `location:*`, `taxonomy:*` to ADMIN and SUPER_ADMIN roles.

---

## ۸. Error Codes (new)

| Code | HTTP |
|------|------|
| `LOCATION_NOT_FOUND` | 404 |
| `TAXONOMY_NOT_FOUND` | 404 |
| `SUGGESTION_NOT_PENDING` | 409 |
| `SLUG_TAKEN` | 409 |
| `PARENT_NOT_FOUND` | 400 |
| `MERGE_TARGET_INVALID` | 400 |
| `CATEGORY_OFFICIAL_PROTECTED` | 403 — cannot delete official seed category |

---

## ۹. Rate Limiting (deferred — CTO Phase 2 Condition 3)

Document only for Phase 3:

| Endpoint group | Future limit |
|----------------|--------------|
| Public slug/taxonomy read | 60/min/IP |
| Admin suggestion create | 30/min/user |

Implementation: Phase 13.
