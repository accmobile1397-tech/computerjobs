# مشخصات فنی — Phase 12: SSR Public Pages

**پروژه:** ComputerJobs.ir  
**فاز:** 12  
**وضعیت:** 📝 **DRAFT — awaiting CTO APPROVE** · **implementation NOT authorized**

**Prerequisites:**
- Phase 11 — ✅ CLOSED · tag `v0.12-phase-11` (D-065)
- [RFC-006 SEO Architecture](../rfc/RFC-006-SEO-ARCHITECTURE.md) — ✅ **FROZEN** (reuse · no new SEO architecture)
- [SEO_STRATEGY.md](../SEO_STRATEGY.md) v1.1 · [.cto/SEO_RULES.md](../../.cto/SEO_RULES.md)
- CTO handoff: [PHASE_12_CTO_HANDOFF.md](./PHASE_12_CTO_HANDOFF.md) — **Option 1** selected

**مرجع:** RFC-006 · ROADMAP (D-046) · [TASKS.md](./TASKS.md) · Phase 11 `modules/seo`

---

## ۰. Baseline (پس از Phase 11)

| مورد | وضعیت |
|------|--------|
| `modules/seo` builders | ✅ |
| `app/sitemap.ts` · `app/robots.ts` | ✅ (`/` only · C-011-5) |
| صفحات عمومی static / jobs / companies | ❌ |
| JobPosting / Breadcrumb **wire** روی صفحه | ❌ (builders موجود) |
| Taxonomy / location hubs | ❌ → خارج از Option 1 |

---

## ۱. Scope

### ۱.۱. هدف

ساخت **موجودی صفحات عمومی SSR** مطابق Option 1: static · jobs · companies — با مصرف builders فاز ۱۱ و گسترش صادقانهٔ sitemap فقط برای مسیرهای زنده.

### ۱.۲. In scope (Option 1 MVP)

| # | Deliverable |
|---|-------------|
| 1 | صفحات static: `/about` · `/contact` · `/privacy` · `/terms` (fa · RTL · SSG/SSR) |
| 2 | `/jobs` — لیست آگهی‌های عمومی منتشرشده |
| 3 | `/jobs/[slug]` — جزئیات آگهی + `generateMetadata` + JobPosting JSON-LD |
| 4 | `/companies` — لیست شرکت‌های عمومی |
| 5 | `/companies/[slug]` — پروفایل عمومی شرکت + metadata |
| 6 | BreadcrumbList JSON-LD روی صفحات عمیق (job · company · static در صورت نیاز) |
| 7 | Metadata همهٔ صفحات از `buildPageMetadata` (Phase 11) |
| 8 | گسترش `SitemapSource`: `static-core` + `jobs-public` + `companies-public` — **فقط URL زنده** |
| 9 | Thin App Router pages — منطق دامنه در `modules/jobs` · `modules/companies` |
| 10 | تست واحد/ادغام سبک + guard (بدون Prisma در Client Components · بدون UUID در URL) |

### ۱.۳. Out of scope

| Item | Owner |
|------|--------|
| `/categories/**` · `/locations/**` · `/skills/**` · `/technologies/**` | Option 2 / later |
| Programmatic `/jobs/[facet]` | later |
| SearchAction / WebSite potentialAction | **C-011-4** — deferred |
| AI Landing Pages | Phase 15 |
| Analytics / GTM / Search Console automation | Phase 13 |
| TD-P10-2 Events Viewer UI | خارج از Phase 12 |
| معماری SEO جدید / بازنویسی RFC-006 | **ممنوع** |
| Migration دیتابیس صرفاً برای SEO | **نیاز نیست** مگر gap واقعی دامنه (جداگانه APPROVE) |

---

## ۲. معماری

```text
app/(public)/…/page.tsx · generateMetadata
        ↓
modules/seo (buildPageMetadata · JSON-LD · canonical)   ← Phase 11 · reuse
        ↓
modules/jobs · modules/companies (read public APIs/services)
        ↓
DB (Server Components / route handlers only)
```

```text
app/sitemap.ts (thin)
        ↓
seo/sitemap sources: static-core · jobs-public · companies-public
```

### HARD RULES

1. **Reuse** RFC-006 + `modules/seo` — بدون معماری SEO جدید  
2. بدون Prisma در Client Components  
3. بدون UUID در URL عمومی (فقط slug)  
4. Sitemap honesty (روح C-011-2) — فقط مسیرهایی که صفحهٔ واقعی دارند و indexable هستند  
5. آگهی/شرکت unpublished یا غیرعمومی → **404** یا noindex + **حذف از sitemap** (نه soft-404)  
6. بدون SearchAction · بدون AI landings  
7. `/admin` · `/api` · auth همچنان خارج از sitemap (robots SoT فاز ۱۱ حفظ شود؛ فقط در صورت نیاز allow جدید مستند شود)

---

## ۳. Deliverable detail

### ۳.۱. Static pages

| Path | Content (fa) | SEO |
|------|--------------|-----|
| `/about` | درباره ComputerJobs.ir | metadata + optional Org/Breadcrumb |
| `/contact` | اطلاعات تماس / فرم ساده (بدون backend جدید مگر موجود) | metadata + Breadcrumb |
| `/privacy` | حریم خصوصی | metadata + Breadcrumb |
| `/terms` | قوانین | metadata + Breadcrumb |

پیاده‌سازی: App Router pages · محتوای Markdown/MDX یا کامپوننت استاتیک — تصمیم پیاده‌سازی در IMPLEMENTATION_PLAN پس از APPROVE.

### ۳.۲. Jobs

| Path | Behavior |
|------|----------|
| `/jobs` | لیست آگهی‌های **منتشرشدهٔ عمومی** · pagination با **C-011-6** (self-canonical) |
| `/jobs/[slug]` | جزئیات · `notFound()` اگر slug نامعتبر/غیرعمومی · JobPosting JSON-LD از builder فاز ۱۱ |

داده: مصرف سرویس‌های موجود `modules/jobs` (public read) — بدون دور زدن entitlement/contact unlock (RFC-001).

### ۳.۳. Companies

| Path | Behavior |
|------|----------|
| `/companies` | لیست شرکت‌های قابل‌نمایش عمومی |
| `/companies/[slug]` | پروفایل عمومی · `notFound()` اگر غیرعمومی |

داده: `modules/companies` public read.

### ۳.۴. Metadata & JSON-LD

| Page | Metadata | JSON-LD |
|------|----------|---------|
| Static | `buildPageMetadata` | Breadcrumb (± Organization on `/about`) |
| `/jobs` | list metadata | Breadcrumb |
| `/jobs/[slug]` | از عنوان/توضیح عمومی آگهی | **JobPosting** + Breadcrumb |
| `/companies` | list metadata | Breadcrumb |
| `/companies/[slug]` | از نام/توضیح شرکت | Breadcrumb (± Organization اگر مناسب) |

**ممنوع:** SearchAction · فیلدهای خصوصی آگهی در JSON-LD.

### ۳.۵. Sitemap expansion

| Source id | Phase 12 |
|-----------|----------|
| `static-core` | `/` + `/about` · `/contact` · `/privacy` · `/terms` |
| `jobs-public` | فقط slugهای آگهی عمومی منتشرشده |
| `companies-public` | فقط slugهای شرکت عمومی |
| taxonomy · locations · ai-landings | همچنان `[]` (خارج از Option 1) |

جمع‌آوری از طریق `collectSitemapEntries` موجود — بدون soft-404.

### ۳.۶. Robots

بدون تغییر اجباری SoT (`app/robots.ts`). Allow عمومی برای مسیرهای جدید به‌صورت پیش‌فرض؛ Disallowهای فاز ۱۱ حفظ شوند.

---

## ۴. Tasks پیشنهادی

| ID | Task |
|----|------|
| P12-001 | اسکلت route group عمومی + layout (در صورت نیاز) |
| P12-002 | Static pages ×۴ + metadata |
| P12-003 | `/jobs` list (public) |
| P12-004 | `/jobs/[slug]` + JobPosting JSON-LD |
| P12-005 | `/companies` list |
| P12-006 | `/companies/[slug]` + metadata |
| P12-007 | Breadcrumb wiring روی صفحات عمیق |
| P12-008 | Sitemap: static-core + jobs-public + companies-public |
| P12-009 | Tests + guards (Prisma-in-client · UUID · honesty) |
| P12-010 | CTO_REPORT / closure handoff |

شماره‌گذاری نهایی: [TASKS.md](./TASKS.md).

---

## ۵. Acceptance criteria

- [ ] CTO APPROVE این TECHNICAL_SPEC قبل از اولین commit پیاده‌سازی  
- [ ] هشت مسیر Option 1 زنده و indexable (با metadata)  
- [ ] `/jobs/[slug]` → JobPosting JSON-LD معتبر یا omit اگر فیلد ناکافی (`null` builder)  
- [ ] Breadcrumb روی صفحات عمیق  
- [ ] Sitemap فقط URLهای زنده · بدون taxonomy/location  
- [ ] بدون SearchAction · بدون AI landing  
- [ ] بدون Prisma در Client Components · بدون UUID در URL عمومی  
- [ ] typecheck · tests سبز  
- [ ] بدون migration SEO مگر gap دامنهٔ جداگانه APPROVE شده  

---

## ۶. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Soft-404 در sitemap | فقط published/public · `notFound` برای بقیه |
| نشت فیلد خصوصی در JobPosting | فقط فیلدهای public builder · تست |
| Scope creep به taxonomy | Hard out-of-scope §۱.۳ |
| بازنویسی SEO module | ممنوع — فقط مصرف |
| Pagination SEO drift | C-011-6 self-canonical |

---

## ۷. شرایط پیشنهادی APPROVE

| ID | شرط |
|----|------|
| C-012-1 | پیاده‌سازی فقط پس از APPROVE این TECHNICAL_SPEC |
| C-012-2 | Sitemap honesty — بدون soft-404 |
| C-012-3 | بدون SearchAction · بدون AI landings |
| C-012-4 | بدون taxonomy/location hubs در Option 1 |
| C-012-5 | Reuse `modules/seo` — بدون معماری SEO جدید |
| C-012-6 | Public job/company data only (RFC-001) |

---

## ۸. CTO Decision

| گزینه | معنی |
|--------|------|
| **APPROVE** | implementation مجاز تحت شرایط |
| **APPROVE WITH CONDITIONS** | شرایط اضافه |
| **REJECT** | بازنویسی spec |

**implementation NOT authorized** تا APPROVE.

- [ ] APPROVE  
- [ ] APPROVE WITH CONDITIONS  
- [ ] REJECT  

**Next after APPROVE:** IMPLEMENTATION_PLAN (در صورت نیاز) · سپس P12-001… — **هنوز کد نزن** تا دستور صریح CTO.
