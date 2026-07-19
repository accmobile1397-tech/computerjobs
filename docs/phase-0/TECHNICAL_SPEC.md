# مشخصات فنی — Phase 0: Foundation & Architecture

**پروژه:** ComputerJobs.ir  
**نسخه:** 0.1.0  
**تاریخ:** ۱۴۰۴/۰۴/۲۷

---

## ۱. هدف Phase 0

Phase 0 پایه‌های فنی پلتفرم استخدام AI-Native را بدون پیاده‌سازی قابلیت‌های کسب‌وکار برقرار می‌کند. خروجی این فاز یک پروژه Next.js production-ready با زیرساخت Docker، CI/CD، و مستندات کامل است.

### ۱.۱ محدوده (In Scope)

- Scaffold پروژه Next.js App Router با TypeScript
- پیکربندی TailwindCSS و shadcn/ui با پشتیبانی RTL فارسی
- Docker Compose برای MySQL 8، Redis 7، MinIO
- Prisma ORM setup (بدون مدل‌های کسب‌وکار)
- BullMQ worker skeleton
- Health check endpoints
- Security headers baseline
- Structured logging (pino)
- GitHub Actions CI
- مستندات فنی فارسی

### ۱.۲ خارج از محدوده (Out of Scope)

| قابلیت | فاز |
|--------|-----|
| Authentication / JWT / RBAC | Phase 1 |
| سیستم موقعیت ایران (۳۱ استان) | Phase 2 |
| Taxonomy Engine (۱۵ دسته) | Phase 3 |
| Job Posting | Phase 4 |
| Resume Builder | Phase 5 |
| Search Engine | Phase 6 |
| AI Gateway | Phase 7 |
| Payments | Phase 9 |
| Notifications | Phase 10 |
| Advertisement System | Phase 11 |

---

## ۲. Stack فناوری

### Frontend
- Next.js App Router (SSR/SSG)
- TypeScript
- TailwindCSS
- shadcn/ui

### Backend
- Node.js
- Next.js API Routes (`/api/v1/...`)

### Database
- MySQL 8
- Prisma ORM

### Caching & Queue
- Redis 7
- BullMQ

### Storage
- S3 Compatible (MinIO در dev/staging)

### Authentication (آینده)
- JWT + Refresh Tokens + RBAC

### Deployment
- **VPS واحد با OpenShip:** Next.js، MySQL، Redis، BullMQ Worker و MinIO همگی روی VPS self-hosted
- OpenShip: push-to-deploy، SSL خودکار، مدیریت env و سرویس‌ها
- Docker Compose برای سرویس‌های داده + GitHub Actions CI/CD

---

## ۳. اصول غیرقابل مذاکره

1. **AI First** — AI اختیاری؛ core functions بدون AI کار می‌کنند
2. **SEO First** — SSR، metadata، structured data از روز اول
3. **Security First** — headers، env validation، no secrets in repo
4. **Mobile First** — breakpoints و layout responsive
5. **Accessibility First** — semantic HTML، ARIA پایه
6. **Spec Driven Development** — spec قبل از کد
7. **Event Driven Architecture** — BullMQ از Phase 0
8. **Queue First Processing** — worker skeleton آماده
9. **Observability First** — structured logging + health checks
10. **Zero Vendor Lock-In** — abstraction layers در spec

---

## ۴. قراردادهای کدنویسی

### ۴.۱ Naming Conventions

| نوع | قرارداد | مثال |
|-----|---------|------|
| فایل‌ها | kebab-case | `health-check.ts` |
| کامپوننت‌ها | PascalCase | `JobCard.tsx` |
| توابع | camelCase | `getHealthStatus()` |
| ثابت‌ها | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| API routes | kebab-case | `/api/v1/health/deep` |
| DB tables | PascalCase (Prisma) | `JobPosting` |
| DB columns | camelCase | `createdAt` |

### ۴.۲ ساختار پوشه‌ها

```
src/
├── app/              # App Router pages & API
├── components/       # React components
│   └── ui/           # shadcn/ui
├── lib/              # Business logic & utilities
│   ├── db/
│   ├── redis/
│   ├── queue/
│   ├── storage/
│   └── logger/
└── types/            # TypeScript types
```

### ۴.۳ Audit Fields (الزامی برای همه جداول)

هر جدول در فازهای بعد باید شامل این فیلدها باشد:

```prisma
id        String    @id @default(uuid())
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt
deletedAt DateTime? // soft delete
```

### ۴.۴ Soft Delete

- حذف منطقی با `deletedAt` — هرگز hard delete برای داده‌های کسب‌وکار
- queryها به‌صورت پیش‌فرض `deletedAt IS NULL` فیلتر می‌کنند

---

## ۵. قرارداد UI/UX

### ۵.۱ RTL & Persian

- `dir="rtl"` و `lang="fa"` در root layout
- فونت فارسی: Vazirmatn via `next/font`
- تمام متن‌های UI به فارسی

### ۵.۲ Mobile First

- Tailwind breakpoints: `sm` → `md` → `lg` → `xl`
- طراحی ابتدا برای موبایل، سپس desktop

### ۵.۳ SEO First

- SSR برای صفحات عمومی
- Dynamic metadata در هر page
- OpenGraph + Twitter Cards
- Structured data (JSON-LD) در فازهای بعد

---

## ۶. Graceful Degradation Policy

پلتفرم **باید** بدون AI کار کند. اگر همه AI providers fail شوند:

**ادامه کار می‌کند:**
- Registration, Login
- Resume Builder
- Job Posting
- Search
- Payments
- Notifications
- Admin Panel

**غیرفعال می‌شود:**
- AI Chat
- AI Resume Analysis
- AI Matching
- AI Skill Extraction
- AI Content Generation

**پیام به کاربر:** «سرویس AI موقتاً در دسترس نیست»

---

## ۷. Environment Variables

تمام متغیرها در `.env.example` مستند شده‌اند. validation با zod در `src/lib/env.ts` — fail fast در boot.

**هرگز secret واقعی commit نشود.**

---

## ۸. مراجع

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_DESIGN.md](./API_DESIGN.md)
- [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)
