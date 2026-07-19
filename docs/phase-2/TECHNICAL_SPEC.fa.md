# مشخصات فنی — Phase 2: User Profiles & Company Management

**پروژه:** ComputerJobs.ir  
**نسخه:** 2.0.0-spec  
**فاز:** 2  
**وضعیت:** ⏳ در انتظار تأیید CTO — **بدون پیاده‌سازی کد**

---

## ۱. هدف Phase 2

تکمیل **پروفایل کاربران** (کارجو و کارفرما) و **مدیریت شرکت** روی پایه IAM فاز ۱، تا فازهای Jobs/Resume بدون بازنویسی هویت ساخته شوند.

### ۱.۱ محدوده (In Scope)

| حوزه | توضیح |
|------|--------|
| **Job Seeker Profile** | headline, bio, avatar, visibility, completion score |
| **Employer Profile** | عنوان شغلی، bio، اتصال به شرکت |
| **Company CRUD** | ایجاد/ویرایش/حذف نرم شرکت توسط owner |
| **Company public page data** | slug, logo, website, description, size band |
| **Company members** | OWNER / ADMIN / MEMBER — دعوت، پذیرش، حذف |
| **Employer verification** | workflow PENDING_REVIEW → VERIFIED / REJECTED (admin API stub) |
| **Permissions** | seed مجوزهای `profile:*`, `company:*` |
| **Audit** | رویدادهای PROFILE_UPDATED, COMPANY_*, MEMBER_* |
| **Modules** | `users/` (گسترش), `companies/` (جدید) |

### ۱.۲ خارج از محدوده (Out of Scope)

| قابلیت | دلیل | فاز |
|--------|------|-----|
| Location DB (استان/شهر) | skeleton فقط | Phase 3 |
| Taxonomy (صنعت/مهارت) | skeleton — فیلد `industryLabel` متنی | Phase 3+ |
| SEO public pages UI | metadata API-ready | Phase SEO |
| Resume / Job entities | — | Phase 4+ |
| File upload production (S3) | URL string OK; upload stub | Phase storage hardening |
| OAuth / 2FA | — | — |

---

## ۲. انواع کاربر و دسترسی

| primaryType | Profile API | Company API |
|-------------|-------------|-------------|
| JOB_SEEKER | ✅ job-seeker profile | ❌ |
| EMPLOYER | ✅ employer profile | ✅ own company + members |
| ADMIN | read profiles | read companies + verify |
| SUPER_ADMIN | full | full |

Authorization از `modules/authorization/` — **بدون hardcode role**.

---

## ۳. Job Seeker Profile

### ۳.۱ فیلدهای جدید (نسبت به Phase 1)

| فیلد | نوع | توضیح |
|------|-----|--------|
| headline | string? | max 160 |
| bio | text? | max 2000 |
| avatarUrl | string? | URL |
| cityLabel | string? | متن آزاد تا Phase 3 Location |
| profileVisibility | enum | PUBLIC / EMPLOYERS_ONLY / PRIVATE |
| completionScore | int | 0–100 computed |

### ۳.۲ قوانین

- فقط کاربر ACTIVE می‌تواند پروفایل public کند
- `displayName` از Phase 1 حفظ می‌شود
- soft delete همچنان روی profile

---

## ۴. Employer Profile

| فیلد | نوع | توضیح |
|------|-----|--------|
| jobTitle | string? | max 120 |
| bio | text? | max 2000 |
| companyId | uuid? | FK — یک employer یک شرکت primary |
| verificationStatus | enum | موجود Phase 1 |

Employer در register می‌تواند company name بدهد — Phase 2 company record کامل می‌سازد.

---

## ۵. Company

### ۵.۱ فیلدهای جدید (extension)

| فیلد | نوع | توضیح |
|------|-----|--------|
| slug | string | unique, URL-safe, فارسی transliterate |
| description | text? | max 5000 |
| logoUrl | string? | |
| websiteUrl | string? | validated URL |
| employeeCountRange | enum | SIZE_1_10 … SIZE_1000_PLUS |
| industryLabel | string? | تا taxonomy — متن آزاد |
| verificationStatus | enum | PENDING / VERIFIED / REJECTED |
| verifiedAt | datetime? | |

### ۵.۲ Ownership

- `ownerId` از Phase 1
- owner همیشه CompanyMember با role OWNER
- transfer ownership: POST `/companies/:id/transfer-ownership` (Phase 2)

---

## ۶. Company Members

| role | مجوز |
|------|------|
| OWNER | همه + transfer ownership |
| ADMIN | edit company, manage members (not owner) |
| MEMBER | read company, post jobs (future) |

**Invite flow (Phase 2):**
1. OWNER/ADMIN → POST invite (email)
2. Token hash در DB
3. User register/login → POST accept invite
4. CompanyMember created

---

## ۷. ماژول‌ها

```text
src/modules/users/
  services/profile.service.ts
  repositories/profile.repository.ts
  validators/profile.schema.ts

src/modules/companies/
  services/company.service.ts
  services/member.service.ts
  services/invite.service.ts
  repositories/
  validators/
```

API routes نازک در `src/app/api/v1/`.

---

## ۸. وابستگی به Phase 1

- JWT + RBAC unchanged
- `/users/me` گسترش می‌یابد یا endpointهای nested
- Company skeleton از migration Phase 1 extend می‌شود

---

## ۹. SEO (آماده‌سازی)

- `Company.slug` برای `/companies/{slug}` در SEO_STRATEGY
- Public GET company by slug — no auth
- noindex برای draft/unverified (optional flag)

---

## ۱۰. Gate

🟢 **پس از تأیید CTO:** پیاده‌سازی روی `main` — commit + review.

**Do NOT implement until approved.**
