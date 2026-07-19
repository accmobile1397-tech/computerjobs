# مشخصات فنی — Phase 2: User Profiles & Company Management

**پروژه:** ComputerJobs.ir  
**نسخه:** 2.1.0-spec  
**فاز:** 2  
**وضعیت:** 🟢 **Approved for Implementation** — CTO APPROVE WITH MINOR CONDITIONS (2026-07-19)

---

## ۱. هدف Phase 2

تکمیل **پروفایل کاربران** (کارجو و کارفرما) و **مدیریت شرکت** روی پایه IAM فاز ۱.

### ۱.۱ محدوده (In Scope)

| حوزه | توضیح |
|------|--------|
| **User slug** | `users.slug` — URL آینده `/profiles/{slug}` |
| **Job Seeker Profile** | headline, bio, avatarUrl, visibility, completionScore |
| **Employer Profile** | jobTitle, bio, verification workflow |
| **Company CRUD** | slug, status, verification, members, invites |
| **Permissions** | `profile:*`, `company:*` |
| **Audit** | رویدادهای کامل (§۸) |
| **Modules** | `users/` (گسترش), `companies/` (جدید) |

### ۱.۲ خارج از محدوده (Out of Scope)

| قابلیت | دلیل | فاز |
|--------|------|-----|
| Avatar/logo **upload** | فقط `avatarUrl` / `logoUrl` string | Phase storage |
| Location DB | `cityLabel` متن آزاد | Phase 3 |
| Taxonomy DB | `industryLabel` → `industryId` بعداً | Phase 3 |
| Jobs / Resume | وابسته به Taxonomy + Location | Phase 4+ |
| OAuth / 2FA | — | — |

---

## ۲. User Slug (CTO Condition 1)

فیلد **`users.slug`** روی مدل `User` (نه فقط Company):

| قانون | توضیح |
|-------|--------|
| unique | globally unique among active users |
| format | URL-safe، transliterate فارسی |
| SEO | آینده: `/profiles/{slug}` |
| set | در PATCH profile یا auto از displayName |

---

## ۳. Job Seeker Profile

| فیلد | نوع | توضیح |
|------|-----|--------|
| displayName | string? | Phase 1 |
| headline | string? | max 160 |
| bio | text? | max 2000 — plain text |
| avatarUrl | string? | **URL only — no upload logic** |
| cityLabel | string? | متن آزاد تا Phase 3 (CTO تأیید شد) |
| profileVisibility | enum | PUBLIC / EMPLOYERS_ONLY / PRIVATE |
| completionScore | int | 0–100 computed |

### ۳.۱ Profile Visibility (CTO Condition 6)

| مقدار | معنی |
|-------|------|
| PUBLIC | قابل مشاهده عمومی (طبق policy) |
| EMPLOYERS_ONLY | فقط employer/admin احراز هویت‌شده |
| PRIVATE | فقط خود کاربر |

**پیش‌فرض:** PRIVATE

---

## ۴. Employer Profile & Verification (CTO Condition 2)

### ۴.۱ Verification Workflow

```text
PENDING → UNDER_REVIEW → VERIFIED
                      ↘ REJECTED
```

| Status | معنی |
|--------|------|
| PENDING | تازه ثبت — منتظر ارسال مدارک |
| UNDER_REVIEW | admin در حال بررسی |
| VERIFIED | تأیید شده |
| REJECTED | رد شده |

> Migration Phase 2: `PENDING_REVIEW` (Phase 1) → `PENDING`

Admin API: PATCH `/admin/employers/:id/verification`

---

## ۵. Company (CTO Conditions 3 & 4)

### ۵.۱ Verification (مستقل از status)

| Status | معنی |
|--------|------|
| PENDING | جدید |
| UNDER_REVIEW | در حال بررسی |
| VERIFIED | تأیید عمومی |
| REJECTED | رد |

### ۵.۲ Company Status (مدیریت محتوا)

| Status | معنی |
|--------|------|
| ACTIVE | فعال — قابل نمایش (اگر verified) |
| SUSPENDED | تعلیق توسط admin |
| DELETED | soft delete / غیرفعال |

`deletedAt` همچنان برای soft delete؛ `status=DELETED` برای moderation.

### ۵.۳ فیلدهای دیگر

| فیلد | توضیح |
|------|--------|
| slug | unique — `/companies/{slug}` |
| logoUrl | **URL only — no upload logic** |
| industryLabel | متن آزاد — **§۷ migration به industryId** |
| employeeCountRange | enum size band |

---

## ۶. Taxonomy Integration (CTO Condition 7)

Phase 2:

```text
companies.industry_label  (VARCHAR)
```

Phase 3 (Taxonomy):

```text
companies.industry_id     (UUID FK → taxonomy)
```

Migration path documented in DATABASE_DESIGN — backfill از label optional.

---

## ۷. Location (CTO تأیید)

Phase 2: **`cityLabel`** روی profile — بدون `cityId`  
Phase 3: **`cityId`** FK → location module

---

## ۸. Audit Events (CTO Condition 5)

| Event | Trigger |
|-------|---------|
| PROFILE_UPDATED | PATCH profile / user slug |
| COMPANY_CREATED | POST company |
| COMPANY_UPDATED | PATCH company |
| COMPANY_DELETED | DELETE company |
| MEMBER_INVITED | POST invite |
| MEMBER_ACCEPTED | POST accept invite |
| MEMBER_REMOVED | DELETE member |
| OWNERSHIP_TRANSFERRED | POST transfer-ownership |

---

## ۹. Company Members

OWNER / ADMIN / MEMBER — invite flow unchanged.

---

## ۱۰. ماژول‌ها

```text
src/modules/users/     — profile + user slug
src/modules/companies/ — company, members, invites
```

---

## ۱۱. Gate

🟢 **Approved for Implementation** — commit on `main`.

---

## ۱۲. Phase 3 (CTO roadmap — spec only)

بعد از Phase 2:

| Phase 3 scope | Location · Taxonomy · Skills · Technologies |
| Jobs | Phase 4+ (depends on Taxonomy + Location) |
