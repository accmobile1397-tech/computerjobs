# مشخصات فنی — Phase 11: SEO Foundation

**پروژه:** ComputerJobs.ir  
**فاز:** 11  
**وضعیت:** 📝 **DRAFT — awaiting CTO APPROVE** · **implementation NOT authorized**

**Prerequisites:**
- Phase 10 — ✅ CLOSED · tag `v0.11-phase-10` (D-055)
- [RFC-006 SEO Architecture](../rfc/RFC-006-SEO-ARCHITECTURE.md) — 📝 DRAFT (must be **FROZEN** before implement)
- D-014 · [SEO_STRATEGY.md](../SEO_STRATEGY.md) · [.cto/SEO_RULES.md](../../.cto/SEO_RULES.md)
- CTO handoff: [PHASE_11_CTO_HANDOFF.md](./PHASE_11_CTO_HANDOFF.md) — Option 1 selected

**مرجع:** RFC-006 · ROADMAP (D-046) · AI_CTO_STATUS

---

## ۰. Baseline audit (خلاصه)

| مورد | وضعیت |
|------|--------|
| Root metadata · RTL · fa | ✅ |
| `public/robots.txt` | ✅ ولی به sitemap ناموجود اشاره می‌کند |
| `sitemap.xml` | ❌ |
| صفحات عمومی jobs/companies/taxonomy | ❌ (API هست؛ SSR → Phase 12) |
| ماژول `seo` | ❌ |
| JSON-LD | ❌ |

---

## ۱. Scope

### ۱.۱. هدف

ایجاد **زیربنای SEO** مطابق RFC-006 و **Option 1**: ماژول builders + sitemap صادقانه + robots یکپارچه — **بدون** ساخت موجودی کامل صفحات عمومی.

### ۱.۲. In scope (MVP)

| # | Deliverable |
|---|-------------|
| 1 | اسکلت `src/modules/seo/` (metadata · canonical · urls · structured-data · sitemap · robots · types) |
| 2 | `buildPageMetadata` + تست واحد |
| 3 | `normalizePublicPath` + سیاست canonical (strip utm · بدون trailing slash) |
| 4 | Builders JSON-LD: Organization · WebSite · JobPosting · Breadcrumb (+ تست؛ wiring محدود) |
| 5 | `SitemapSource` + `static-core`؛ منابع دامنه خالی تا Phase 12 |
| 6 | App Router `sitemap.ts` (thin) — فقط مسیرهای زنده |
| 7 | SoT واحد برای robots (`robots.ts` و/یا جایگزینی `public/robots.txt`) + خط Sitemap معتبر |
| 8 | سیاست noindex مستند + اعمال روی `/admin/*` (موجود) و آماده‌سازی برای auth routes وقتی صفحه دارند |
| 9 | به‌روزرسانی برچسب فاز در [SEO_STRATEGY.md](../SEO_STRATEGY.md) برای مرز 11/12 |
| 10 | تست واحد builders + guard عدم import Prisma در کلاینت عمومی مرتبط |

### ۱.۳. Out of scope

| Item | Owner |
|------|--------|
| `/jobs/[slug]` · `/companies/[slug]` · taxonomy/location pages | Phase 12 |
| `/about` · `/contact` · `/terms` · `/privacy` | Phase 12 |
| Core Web Vitals program | Phase 12+ |
| Analytics / GTM / Search Console automation | Phase 13 |
| AI Landing Pages | Extension RFC-006 §12 · Phase 15 |
| TD-P10-2 Events Viewer UI | خارج از Phase 11 |
| Feature Flag Engine | TD-ADMIN-1 |
| Migration دیتابیس برای SEO | **نیاز نیست** برای MVP |

---

## ۲. معماری (خلاصه RFC-006)

```text
app/sitemap.ts · app/robots.ts · generateMetadata
        ↓
modules/seo/*
        ↓
Domain read APIs (فقط وقتی صفحه زنده است — Phase 12)
```

HARD RULES:
- بدون Prisma در Client Components  
- بدون UUID در URL عمومی SEO  
- Sitemap فقط URLهای واقعی و indexable  
- `/admin` و auth در sitemap نیستند  

جزئیات قراردادها: **RFC-006** (SoT معماری).

---

## ۳. Deliverable detail

### ۳.۱. Metadata

- ورودی: title · description · path · robots · OG اختیاری  
- خروجی: سازگار با Next.js Metadata API (پیاده‌سازی با خواندن docs Next 16 در زمان implement)  
- Phase 11: اعمال روی `/` در حد بهبود/یکپارچگی با builder؛ صفحات جدید → Phase 12  

### ۳.۲. Canonical

- `APP_URL + normalizePublicPath(path)`  
- حذف `utm_*` و پارامترهای tracking شناخته‌شده  
- پیش‌فرض pagination: **self-canonical** (prev/next → Phase 12)  

### ۳.۳. Sitemap

| Source | Phase 11 |
|--------|----------|
| `static-core` | `/` (+ مسیرهای عمومی واقعاً render شده) |
| `jobs-public` · `companies-public` · `taxonomy` · `locations` · `ai-landings` | ثبت interface؛ `listEntries() → []` |

### ۳.۴. robots

| Pattern | Policy |
|---------|--------|
| `/admin` · `/admin/*` | Disallow |
| `/api/*` | Disallow |
| `/login` · `/register` · `/dashboard/*` | Disallow (وقتی مسیر وجود دارد) |
| سایر | Allow |
| Sitemap | URL مطلق به endpoint واقعی |

### ۳.۵. JSON-LD

Builders خالص + تست. Embedding کامل روی صفحات موجودی → Phase 12. در Phase 11 مجاز: Organization/WebSite روی `/` اگر CTO در review تأیید کند (اختیاری MVP+).

### ۳.۶. AI Landing extension

فقط stub typed / source خالی مطابق RFC-006 §12 — **بدون** صفحه و بدون فراخوانی AI Gateway.

---

## ۴. Tasks پیشنهادی (پس از APPROVE)

| ID | Task |
|----|------|
| P11-001 | اسکلت ماژول `seo` + README |
| P11-002 | urls · normalizePublicPath · canonical |
| P11-003 | metadata builders |
| P11-004 | JSON-LD builders + tests |
| P11-005 | sitemap sources + `sitemap.ts` |
| P11-006 | robots SoT |
| P11-007 | Wire `/` metadata (± JSON-LD اختیاری) |
| P11-008 | به‌روز SEO_STRATEGY phase labels |
| P11-009 | Unit tests + guards |
| P11-010 | CTO_REPORT handoff |

_(شماره‌گذاری نهایی در TASKS.md پس از APPROVE.)_

---

## ۵. Acceptance criteria

- [ ] RFC-006 FROZEN قبل از اولین commit پیاده‌سازی  
- [ ] `GET /sitemap.xml` (یا معادل App Router) → ۲۰۰ و شامل فقط مسیرهای زنده  
- [ ] robots به همان sitemap اشاره می‌کند  
- [ ] Builders metadata/canonical/JSON-LD تست واحد سبز  
- [ ] هیچ entry مربوط به `/admin` در sitemap نیست  
- [ ] هیچ migration Prisma برای SEO MVP اضافه نشده  
- [ ] مرز Phase 12 در docs روشن است  
- [ ] typecheck · vitest سبز  

---

## ۶. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Sitemap برای صفحات آینده | منابع دامنه خالی تا صفحه زنده شود |
| دو SoT برای robots | یک منبع فقط |
| خزش scope به SSR | Hard out-of-scope §۱.۳ |
| APP_URL اشتباه در prod | Ops note MED-001 |

---

## ۷. شرایط پیشنهادی برای APPROVE

| ID | شرط |
|----|------|
| C-011-1 | پیاده‌سازی فقط پس از **FROZEN** شدن RFC-006 |
| C-011-2 | Sitemap honesty — بدون soft-404 تعمدی |
| C-011-3 | بدون صفحه SSR جدید دامنه (jobs/companies/…) در Phase 11 مگر مسیر از قبل زنده باشد |
| C-011-4 | AI landings فقط extension point — بدون impl |

---

## ۸. CTO Decision

| گزینه | معنی |
|--------|------|
| **APPROVE** | RFC-006 باید جداگانه FROZEN شده باشد؛ سپس implementation مجاز |
| **APPROVE WITH CONDITIONS** | شرایط اضافه |
| **REJECT** | بازنویسی spec/RFC |

**implementation NOT authorized** تا این سند + RFC-006 هر دو APPROVE/FROZEN شوند.

- [ ] APPROVE  
- [ ] APPROVE WITH CONDITIONS  
- [ ] REJECT  

**Next after APPROVE:** TASKS.md + IMPLEMENTATION_PLAN · سپس P11-001… — **هنوز کد نزن** تا دستور صریح CTO.
