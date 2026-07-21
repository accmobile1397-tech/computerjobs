# SEO Strategy — ComputerJobs.ir

**نسخه:** 1.1  
**وضعیت:** Active — URL map SoT (D-014)  
**Architecture:** [RFC-006](./rfc/RFC-006-SEO-ARCHITECTURE.md) (FROZEN · D-056)  
**Remap:** P11-008 — phase labels aligned to Phase **11** (SEO Foundation) vs Phase **12** (SSR Public Pages)

---

## Phase boundary (authoritative)

| Layer | Phase | Owns |
|-------|-------|------|
| URL patterns · slug rules | This document + RFC-006 | Catalog only |
| SEO builders · sitemap · robots · `/` wiring | **11** | Foundation (Option 1) |
| Public SSR page inventory · per-page `generateMetadata` · programmatic lists | **12** | Rendering |

**Historical note:** Older “Phase 2 / 3 / 4 / 6” labels meant *domain data / APIs exist*. They do **not** mean public SSR pages shipped. **Indexable page rendering** for those URLs is **Phase 12** unless a route is already live (today: `/` only).

---

## اصول

- Persian First · RTL · Mobile First  
- Readable URLs — بدون ID خام در URL عمومی  
- SSR برای صفحات indexable  
- هر URL عمومی: title, description, canonical, OpenGraph  

---

## URL Map — Public Pages

### Home & Static

| URL | Page | Data | Public SSR / SEO |
|-----|------|------|------------------|
| `/` | صفحه اصلی | 0 | **0** + **11** (metadata · Org/WebSite JSON-LD) |
| `/about` | درباره ما | — | **12** |
| `/contact` | تماس | — | **12** |
| `/terms` | قوانین | — | **12** |
| `/privacy` | حریم خصوصی | — | **12** |

### Jobs (Programmatic SEO)

| URL Pattern | Example | Data ready | Public SSR / SEO |
|-------------|---------|------------|------------------|
| `/jobs` | لیست همه | 4 | **12** |
| `/jobs/[province]` | `/jobs/tehran` | 4 | **12** |
| `/jobs/[category]` | `/jobs/software-development` | 4 | **12** |
| `/jobs/[subcategory]` | `/jobs/full-stack` | 4 | **12** |
| `/jobs/[skill]` | `/jobs/typescript` | 6 | **12** |
| `/jobs/[technology]` | `/jobs/nextjs` | 6 | **12** |
| `/jobs/[category]/[province]` | `/jobs/devops/tehran` | 6 | **12** |
| `/jobs/[slug]` | `/jobs/senior-backend-tehran-abc123` | 4 | **12** |

> Slug-based job detail — slug در URL، UUID فقط internal.  
> JobPosting JSON-LD **builder** = Phase **11** · page embed = Phase **12**.

### Companies

| URL Pattern | Example | Data ready | Public SSR / SEO |
|-------------|---------|------------|------------------|
| `/companies` | لیست شرکت‌ها | 4 | **12** |
| `/companies/[slug]` | `/companies/snapp` | 4 | **12** |

### Location SEO

| URL Pattern | Example | Data ready | Public SSR / SEO |
|-------------|---------|------------|------------------|
| `/locations` | همه استان‌ها | 2 | **12** |
| `/locations/[province]` | `/locations/tehran` | 2 | **12** |
| `/locations/[province]/[city]` | `/locations/tehran/tehran-city` | 2 | **12** |

### Taxonomy SEO

| URL Pattern | Example | Data ready | Public SSR / SEO |
|-------------|---------|------------|------------------|
| `/categories` | 15 دسته | 3 | **12** |
| `/categories/[category]` | `/categories/ai-data-science` | 3 | **12** |
| `/categories/[category]/[subcategory]` | `/categories/software/full-stack` | 3 | **12** |
| `/skills/[skill]` | `/skills/typescript` | 3 | **12** |
| `/technologies/[tech]` | `/technologies/nextjs` | 3 | **12** |

### Auth (noindex)

| URL | robots | Notes |
|-----|--------|-------|
| `/login` | noindex · robots Disallow | Phase **11** robots SoT |
| `/register` | noindex · robots Disallow | Phase **11** robots SoT |
| `/dashboard/*` | noindex · robots Disallow | Phase **11** robots SoT |
| `/admin/*` | noindex · robots Disallow | Phase **11** robots SoT |

---

## Structured Data (JSON-LD)

| Schema | Pages | Builder | Page wiring |
|--------|-------|---------|-------------|
| Organization | `/` | **11** | **11** |
| Organization | `/about` | **11** | **12** |
| WebSite (**no** SearchAction until public search live · C-011-4) | `/` | **11** | **11** |
| SearchAction | `/` | deferred | deferred (not Phase 11) |
| JobPosting | `/jobs/[slug]` | **11** | **12** |
| BreadcrumbList | deep public pages | **11** | **12** |

---

## Technical SEO Checklist

| Item | Status | Target |
|------|--------|--------|
| robots SoT (`app/robots.ts`) | ✅ Phase **11** (C-011-5) | maintain |
| `sitemap.xml` (honest · live URLs only) | ✅ Phase **11** sparse (`/` · C-011-2) | expand in **12** |
| Canonical builders | ✅ Phase **11** | per-page wire in **12** |
| OpenGraph | ✅ root + `/` (Phase **11**) | all public in **12** |
| Home metadata + Org/WebSite JSON-LD | ✅ Phase **11** | — |
| Core Web Vitals | not measured | **12**+ |
| Image optimization | next/image | ongoing |
| Domain public SSR inventory | ❌ | **12** |

---

## Slug Conventions

- Persian slug transliteration یا English kebab-case — **تصمیم Phase 3** (data)  
- Max length: 80 chars  
- Unique per entity type  
- No UUID segments on public SEO URLs (RFC-006)

---

## Content Language

- Meta title/description: **فارسی**  
- `lang="fa"` + `dir="rtl"`  
- OpenGraph `locale`: `fa_IR`  

---

## References

- `.cto/SEO_RULES.md`
- `docs/rfc/RFC-006-SEO-ARCHITECTURE.md`
- `docs/phase-11/TECHNICAL_SPEC.fa.md`
- `docs/phase-0/SEO_REVIEW.md`
- D-014 · D-056 · P11-008
