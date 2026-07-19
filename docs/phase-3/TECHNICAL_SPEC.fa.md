# مشخصات فنی — Phase 3: Location · Taxonomy · Skills · Technologies

**پروژه:** ComputerJobs.ir  
**نسخه:** 3.0.0-spec  
**فاز:** 3  
**وضعیت:** ⏳ **در انتظار تأیید CTO** — **بدون پیاده‌سازی کد**

---

## ۱. هدف Phase 3

ایجاد **زیرساخت جغرافیایی ایران** و **موتور Taxonomy چهارسطحی** به‌عنوان پیش‌نیاز Phase 4 (Jobs).

### ۱.۱ محدوده (In Scope)

| حوزه | توضیح |
|------|--------|
| **Province** | ۳۱ استان ایران — slug، فعال/غیرفعال |
| **City** | شهرها per province — slug |
| **Category** | ۱۵ دسته رسمی (seed) |
| **SubCategory** | زیردسته per category |
| **Skill** | مهارت — وابسته به subcategory |
| **Technology** | فناوری — وابسته به skill |
| **AI Suggestion** | پیشنهاد AI — **فقط Pending** |
| **Admin Approval** | Approve / Reject / Merge |
| **Migration Phase 2** | `cityLabel` → `cityId`، `industryLabel` → `categoryId` |
| **Seed** | استان‌ها، شهرها، ۱۵ category |
| **Permissions** | `location:*`, `taxonomy:*` |
| **Audit** | رویدادهای taxonomy + location admin |
| **Public read APIs** | لیست/جزئیات slug-based |

### ۱.۲ خارج از محدوده (Out of Scope)

| قابلیت | دلیل | فاز |
|--------|------|-----|
| Jobs / Job posting | وابسته به Taxonomy + Location | 4 |
| Resume Builder | — | 5 |
| Search & Matching | — | 6 |
| AI Gateway production | suggestion stub/admin API فقط | 7–8 |
| Rate limiting production | CTO Condition Phase 2 | 13 |
| Profile/Company SEO metadata + JSON-LD | CTO Condition Phase 2 | 12 |
| SSR pages `/locations/*`, `/categories/*` | API-first؛ UI Phase 12 | 12 |
| File upload | — | storage phase |

---

## ۲. Location Module

### ۲.۱ سلسله‌مراتب

```text
Province (31) → City (N)
```

### ۲.۲ قوانین

| قانون | توضیح |
|-------|--------|
| slug | URL-safe، یکتا در سطح entity |
| isActive | admin می‌تواند province/city را غیرفعال کند |
| seed | `modules/location/seed/` — ۳۱ استان + شهرها |
| SEO | `/locations/[province]`, `/locations/[province]/[city]` (Phase 12 UI) |

### ۲.۳ مهاجرت از Phase 2

| فیلد قدیم | فیلد جدید | استراتژی |
|-----------|-----------|----------|
| `job_seeker_profiles.cityLabel` | `cityId` (nullable FK) | نگه‌داشتن `cityLabel` موقت؛ backfill script؛ PATCH profile از cityId |

---

## ۳. Taxonomy Module

### ۳.۱ سلسله‌مراتب (ADR-0005)

```text
Category (15 official)
  └── SubCategory
        └── Skill
              └── Technology
```

### ۳.۲ قانون حاکمیت (Governance)

```text
AI Suggest → PENDING → Admin Review → Approve | Reject | Merge → Published
```

| قانون | توضیح |
|-------|--------|
| AI never publishes | AI فقط `TaxonomySuggestion` ایجاد می‌کند |
| Admin only publish | approve توسط ADMIN/SUPER_ADMIN |
| Merge | ادغام suggestion با entity موجود |
| Audit | createdBy, approvedBy, timestamps |

### ۳.۳ ۱۵ Category رسمی (Seed)

| # | slug (en) | nameFa |
|---|-----------|--------|
| 1 | software-development | توسعه نرم‌افزار |
| 2 | devops-infrastructure | DevOps و زیرساخت |
| 3 | data-ai | داده و هوش مصنوعی |
| 4 | cybersecurity | امنیت سایبری |
| 5 | product-design | محصول و طراحی |
| 6 | qa-testing | تست و QA |
| 7 | mobile-development | توسعه موبایل |
| 8 | game-development | بازی‌سازی |
| 9 | embedded-iot | Embedded و IoT |
| 10 | blockchain | بلاکچین |
| 11 | it-support | پشتیبانی IT |
| 12 | erp-enterprise | ERP و سازمانی |
| 13 | cloud-architecture | معماری Cloud |
| 14 | database-admin | DBA |
| 15 | technical-management | مدیریت فنی |

> SubCategory / Skill / Technology در seed اولیه **نمونه MVP**؛ گسترش تدریجی با admin + approval.

### ۳.۴ مهاجرت از Phase 2

| فیلد قدیم | فیلد جدید | استراتژی |
|-----------|-----------|----------|
| `companies.industryLabel` | `categoryId` (nullable FK) | نگه‌داشتن label موقت؛ fuzzy match در backfill اختیاری |

`industryLabel` در API Phase 2 deprecated — Phase 3 PATCH company از `categoryId`.

---

## ۴. AI Suggestion Workflow

### ۴.۱ Entity: TaxonomySuggestion

| فیلد | توضیح |
|------|--------|
| entityType | CATEGORY / SUBCATEGORY / SKILL / TECHNOLOGY |
| proposedNameFa / proposedNameEn | — |
| proposedSlug | — |
| parentId | FK به parent در hierarchy |
| source | AI / ADMIN / USER |
| status | PENDING / APPROVED / REJECTED / MERGED |
| aiMetadata | JSON optional — model, prompt hash |

### ۴.۲ Flow

1. Admin (یا stub AI service) `POST /admin/taxonomy/suggestions`
2. Admin لیست pending: `GET /admin/taxonomy/suggestions?status=PENDING`
3. Approve → entity جدید + audit  
4. Reject → status REJECTED + audit  
5. Merge → link به existing entity + audit  

**Phase 3:** AI provider = stub/internal — بدون اتصال OpenAI production.

---

## ۵. Admin Approval Workflow

| Action | Permission | Audit |
|--------|------------|-------|
| List pending suggestions | `taxonomy:read` | — |
| Approve suggestion | `taxonomy:approve` | `TAXONOMY_SUGGESTION_APPROVED` |
| Reject suggestion | `taxonomy:approve` | `TAXONOMY_SUGGESTION_REJECTED` |
| Merge suggestion | `taxonomy:approve` | `TAXONOMY_SUGGESTION_MERGED` |
| CRUD published taxonomy | `taxonomy:write` | `TAXONOMY_*` |
| CRUD location | `location:write` | `LOCATION_*` |

---

## ۶. Public APIs (read-only)

| Resource | Endpoint pattern |
|----------|------------------|
| Provinces | `GET /locations/provinces` |
| Cities | `GET /locations/provinces/:slug/cities` |
| Categories | `GET /taxonomy/categories` |
| SubCategories | `GET /taxonomy/categories/:slug/subcategories` |
| Skills | `GET /taxonomy/skills/:slug` |
| Technologies | `GET /taxonomy/technologies/:slug` |

فقط `isActive=true` و `deletedAt IS NULL`.

---

## ۷. Phase 2 Carryover (CTO Conditions)

| Condition | Phase 3 action |
|-----------|----------------|
| TD-P2-1 Integration tests | پیاده‌سازی قبل از **بستن** Phase 3 |
| TD-P2-2 Employer completion score | بدون تغییر (P3) |
| Audit verification Phase 2 | تست integration + checklist |
| Rate limiting | spec-only note — Phase 13 |
| SEO metadata | spec-only note — Phase 12 |

---

## ۸. Modules

```text
src/modules/location/
  province/
  city/
  seed/

src/modules/taxonomy/
  category/
  subcategory/
  skill/
  technology/
  suggestion/
  approval/
```

API routes thin — logic در services.

---

## ۹. Acceptance Gate

CTO باید تأیید کند:

- [ ] TECHNICAL_SPEC.fa.md  
- [ ] DATABASE_DESIGN.md  
- [ ] API_DESIGN.md  
- [ ] SECURITY_REVIEW.md  

سپس implementation روی `main` مجاز است.

---

## ۱۰. References

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_DESIGN.md](./API_DESIGN.md)
- [ADR-0005](../adr/0005-taxonomy.md)
- [SEO_STRATEGY.md](../SEO_STRATEGY.md)
- [Phase 2 CTO_IMPLEMENTATION_APPROVAL.md](../phase-2/CTO_IMPLEMENTATION_APPROVAL.md)
