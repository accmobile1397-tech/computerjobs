# مشخصات فنی — Phase 11: SEO Foundation

**پروژه:** ComputerJobs.ir  
**فاز:** 11  
**وضعیت:** ✅ **APPROVE WITH CONDITIONS** (D-056 · C-011-1..6) — implementation authorized under conditions · **code not started**

**Prerequisites:**
- Phase 10 — ✅ CLOSED · tag `v0.11-phase-10` (D-055)
- [RFC-006 SEO Architecture](../rfc/RFC-006-SEO-ARCHITECTURE.md) — ✅ **FROZEN** (D-056)
- D-014 · [SEO_STRATEGY.md](../SEO_STRATEGY.md) · [.cto/SEO_RULES.md](../../.cto/SEO_RULES.md)
- CTO handoff: [PHASE_11_CTO_HANDOFF.md](./PHASE_11_CTO_HANDOFF.md) — Option 1 selected

**مرجع:** RFC-006 · ROADMAP (D-046) · [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) · [TASKS.md](./TASKS.md) · D-056

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
| 7 | SoT واحد برای robots — **`robots.ts` (C-011-5)**؛ حذف/جایگزینی `public/robots.txt` متعارض + خط Sitemap معتبر |
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
- **C-011-6:** pagination = **self-canonical** (هر صفحه به خودش؛ prev/next → Phase 12)  

### ۳.۳. Sitemap

| Source | Phase 11 |
|--------|----------|
| `static-core` | `/` (+ مسیرهای عمومی واقعاً render شده) |
| `jobs-public` · `companies-public` · `taxonomy` · `locations` · `ai-landings` | ثبت interface؛ `listEntries() → []` |

### ۳.۴. robots (C-011-5)

| Pattern | Policy |
|---------|--------|
| `/admin` · `/admin/*` | Disallow |
| `/api/*` | Disallow |
| `/login` · `/register` · `/dashboard/*` | Disallow (وقتی مسیر وجود دارد) |
| سایر | Allow |
| Sitemap | URL مطلق به endpoint واقعی |
| SoT | **فقط** App Router `robots.ts` ← `modules/seo/robots` — بدون `public/robots.txt` متعارض |

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
| P11-006 | robots SoT (`robots.ts` · C-011-5) |
| P11-007 | Wire `/` metadata (± JSON-LD اختیاری) |
| P11-008 | به‌روز SEO_STRATEGY phase labels |
| P11-009 | Unit tests + guards |
| P11-010 | CTO_REPORT handoff |

شماره‌گذاری نهایی: [TASKS.md](./TASKS.md).

---

## ۵. Acceptance criteria

- [x] RFC-006 FROZEN (D-056) قبل از اولین commit پیاده‌سازی  
- [ ] `GET /sitemap.xml` (یا معادل App Router) → ۲۰۰ و شامل فقط مسیرهای زنده (C-011-2)  
- [ ] robots SoT = `robots.ts` فقط (C-011-5) · به همان sitemap اشاره می‌کند  
- [ ] Canonical pagination = self-canonical (C-011-6) در builders  
- [ ] Builders metadata/canonical/JSON-LD تست واحد سبز  
- [ ] هیچ entry مربوط به `/admin` در sitemap نیست  
- [ ] هیچ migration Prisma برای SEO MVP اضافه نشده  
- [ ] مرز Phase 12 در docs روشن است  
- [ ] typecheck · vitest سبز  

---

## ۶. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Sitemap برای صفحات آینده | منابع دامنه خالی تا صفحه زنده شود (C-011-2/3) |
| دو SoT برای robots | **C-011-5** — فقط `robots.ts` |
| Pagination canonical drift | **C-011-6** — self-canonical only |
| خزش scope به SSR | Hard out-of-scope §۱.۳ |
| APP_URL اشتباه در prod | Ops note MED-001 |

---

## ۷. شرایط APPROVE (D-056 — registered)

| ID | شرط | Status |
|----|------|--------|
| C-011-1 | پیاده‌سازی فقط پس از **FROZEN** شدن RFC-006 | ✅ FROZEN |
| C-011-2 | Sitemap honesty — بدون soft-404 تعمدی | Active |
| C-011-3 | بدون صفحه SSR جدید دامنه در Phase 11 | Active |
| C-011-4 | AI landings فقط extension — بدون SearchAction تا search عمومی زنده شود | Active |
| **C-011-5** | **Single robots SoT — `robots.ts` preferred** | Active |
| **C-011-6** | **Self-canonical pagination for Phase 11** | Active |

---

## ۸. CTO Decision (recorded)

| نتیجه | معنی |
|--------|------|
| ✅ **APPROVE WITH CONDITIONS** (D-056) | RFC FROZEN · SPEC approved · plan in IMPLEMENTATION_PLAN / TASKS |

**Code:** not started — await explicit start of P11-001.

- [x] APPROVE WITH CONDITIONS  
- [ ] REJECT  
