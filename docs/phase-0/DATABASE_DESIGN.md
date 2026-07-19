# طراحی پایگاه داده — Phase 0

**پروژه:** ComputerJobs.ir  
**DBMS:** MySQL 8  
**ORM:** Prisma  
**نسخه:** 0.1.0

---

## ۱. Phase 0 Scope

Phase 0 فقط foundation را برقرار می‌کند:

- Prisma schema با datasource configuration
- Migration tooling setup
- Seed file placeholder
- الگوی audit fields برای فازهای بعد

**هیچ جدول کسب‌وکار در Phase 0 migrate نمی‌شود.**

---

## ۲. قراردادهای پایگاه داده

### ۲.۱ Primary Keys

- **UUID v4** برای همه جداول
- Prisma: `@id @default(uuid())`

### ۲.۲ Audit Fields (الزامی)

```prisma
model Example {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("examples")
}
```

### ۲.۳ Naming Conventions

| نوع | قرارداد | مثال |
|-----|---------|------|
| Table | snake_case (@@map) | `job_postings` |
| Column | snake_case (@map) | `created_at` |
| Prisma Model | PascalCase | `JobPosting` |
| Prisma Field | camelCase | `createdAt` |
| Index | `idx_{table}_{columns}` | `idx_jobs_category_id` |
| Foreign Key | `fk_{table}_{ref_table}` | `fk_jobs_category_id` |

### ۲.۴ Soft Delete

- `deletedAt DateTime?` — NULL = active, NOT NULL = deleted
- Prisma middleware یا query filter در repository layer

---

## ۳. ERD — طراحی کامل (فازهای آینده)

### ۳.۱ Authentication & RBAC (Phase 1)

```
User
├── id, email, passwordHash, phone
├── roleId → Role
├── createdAt, updatedAt, deletedAt

Role
├── id, name, slug, permissions (JSON)
├── createdAt, updatedAt, deletedAt

RefreshToken
├── id, token, userId → User, expiresAt
├── createdAt, updatedAt, deletedAt
```

**Roles:** admin, employer, job_seeker, moderator

### ۳.۲ Location System (Phase 2)

```
Province
├── id, name, slug, isActive, sortOrder
├── createdAt, updatedAt, deletedAt

City
├── id, name, slug, provinceId → Province
├── isActive, sortOrder
├── createdAt, updatedAt, deletedAt
```

**Seed:** 31 استان + تمام شهرهای ایران

### ۳.۳ Taxonomy Engine (Phase 3)

```
Category
├── id, name, slug, description, isActive, sortOrder
├── createdAt, updatedAt, deletedAt

SubCategory
├── id, name, slug, categoryId → Category
├── isActive, sortOrder
├── createdAt, updatedAt, deletedAt

Skill
├── id, name, slug, subCategoryId → SubCategory
├── isActive
├── createdAt, updatedAt, deletedAt

Technology
├── id, name, slug, skillId → Skill
├── isActive, isEmerging
├── createdAt, updatedAt, deletedAt

TaxonomySuggestion (AI Governance)
├── id, type, suggestedName, source, status
├── reviewedBy → User, reviewedAt
├── createdAt, updatedAt, deletedAt
```

**Seed:** 15 Category + SubCategories از master prompt

### ۳.۴ Job Posting (Phase 4)

```
Company
├── id, name, slug, logo, description, website
├── ownerId → User
├── createdAt, updatedAt, deletedAt

JobPosting
├── id, title, slug, description, requirements
├── companyId → Company
├── categoryId → Category, subCategoryId → SubCategory
├── provinceId → Province, cityId → City
├── employmentType, experienceLevel, salaryRange
├── status (draft, published, closed, archived)
├── publishedAt, expiresAt
├── createdAt, updatedAt, deletedAt

JobSkill / JobTechnology (M2M junction tables)
```

### ۳.۵ Resume Builder (Phase 5)

```
Resume
├── id, userId → User, title, summary
├── isDefault, status
├── createdAt, updatedAt, deletedAt

ResumeSection
├── id, resumeId → Resume, type, content (JSON)
├── sortOrder
├── createdAt, updatedAt, deletedAt

ResumeSkill / ResumeTechnology (M2M)
```

### ۳.۶ Search (Phase 6)

```
SearchIndex (optional — or use external engine)
JobApplication
├── id, jobId → JobPosting, resumeId → Resume
├── userId → User, status, coverLetter
├── createdAt, updatedAt, deletedAt
```

### ۳.۷ AI Gateway (Phase 7)

```
AIProviderLog
├── id, provider, model, promptTokens, completionTokens
├── cost, latencyMs, status, errorMessage
├── userId → User, requestType
├── createdAt, updatedAt, deletedAt

AIProviderHealth
├── id, provider, isHealthy, lastCheckedAt, score
├── createdAt, updatedAt, deletedAt
```

### ۳.۸ Payments (Phase 9)

```
Plan
├── id, name, slug, price, currency, interval
├── features (JSON), isActive
├── createdAt, updatedAt, deletedAt

Subscription
├── id, userId → User, planId → Plan
├── status, startDate, endDate
├── createdAt, updatedAt, deletedAt

UsageRecord
├── id, userId → User, type, count, period
├── createdAt, updatedAt, deletedAt
```

### ۳.۹ Notifications (Phase 10)

```
NotificationTemplate
├── id, name, channel (email/sms/in_app), body
├── isActive
├── createdAt, updatedAt, deletedAt

Notification
├── id, userId → User, templateId, channel
├── status, sentAt, readAt
├── createdAt, updatedAt, deletedAt
```

### ۳.۱۰ Advertisements (Phase 11)

```
Advertisement
├── id, title, imageUrl, linkUrl, type
├── status (pending, approved, rejected, active)
├── startDate, endDate, impressions, clicks
├── createdAt, updatedAt, deletedAt
```

---

## ۴. Index Strategy

| جدول | Index | دلیل |
|------|-------|------|
| همه | `idx_{table}_deleted_at` | soft delete filter |
| JobPosting | `idx_jobs_status_published_at` | listing queries |
| JobPosting | `idx_jobs_category_province` | SEO URL filters |
| User | `idx_users_email` | login lookup |
| City | `idx_cities_province_id` | location hierarchy |
| Skill | `idx_skills_sub_category_id` | taxonomy navigation |

---

## ۵. Migration Workflow

```bash
# ایجاد migration جدید
npx prisma migrate dev --name descriptive_name

# اعمال در production
npx prisma migrate deploy

# seed data
npx prisma db seed
```

---

## ۶. Phase 0 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Models will be added in subsequent phases
```

---

## ۷. مراجع

- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [../MIGRATION.md](../MIGRATION.md)
