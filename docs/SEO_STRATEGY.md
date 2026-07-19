# SEO Strategy — ComputerJobs.ir

**نسخه:** 1.0  
**وضعیت:** Active — URLها از روز اول تعریف شده‌اند  
**Implementation:** تدریجی در فازهای 4–12

---

## اصول

- Persian First · RTL · Mobile First  
- Readable URLs — بدون ID خام در URL عمومی  
- SSR برای صفحات indexable  
- هر URL عمومی: title, description, canonical, OpenGraph  

---

## URL Map — Public Pages

### Home & Static

| URL | Page | Phase | SSR/SSG |
|-----|------|-------|---------|
| `/` | صفحه اصلی | 0 | SSR |
| `/about` | درباره ما | 12 | SSG |
| `/contact` | تماس | 12 | SSG |
| `/terms` | قوانین | 12 | SSG |
| `/privacy` | حریم خصوصی | 12 | SSG |

### Jobs (Programmatic SEO)

| URL Pattern | Example | Phase |
|-------------|---------|-------|
| `/jobs` | لیست همه | 4 |
| `/jobs/[province]` | `/jobs/tehran` | 4 |
| `/jobs/[category]` | `/jobs/software-development` | 4 |
| `/jobs/[subcategory]` | `/jobs/full-stack` | 4 |
| `/jobs/[skill]` | `/jobs/typescript` | 6 |
| `/jobs/[technology]` | `/jobs/nextjs` | 6 |
| `/jobs/[category]/[province]` | `/jobs/devops/tehran` | 6 |
| `/jobs/[slug]` | `/jobs/senior-backend-tehran-abc123` | 4 |

> Slug-based job detail — slug در URL، UUID فقط internal.

### Companies

| URL Pattern | Example | Phase |
|-------------|---------|-------|
| `/companies` | لیست شرکت‌ها | 4 |
| `/companies/[slug]` | `/companies/snapp` | 4 |

### Location SEO

| URL Pattern | Example | Phase |
|-------------|---------|-------|
| `/locations` | همه استان‌ها | 2 |
| `/locations/[province]` | `/locations/tehran` | 2 |
| `/locations/[province]/[city]` | `/locations/tehran/tehran-city` | 2 |

### Taxonomy SEO

| URL Pattern | Example | Phase |
|-------------|---------|-------|
| `/categories` | 15 دسته | 3 |
| `/categories/[category]` | `/categories/ai-data-science` | 3 |
| `/categories/[category]/[subcategory]` | `/categories/software/full-stack` | 3 |
| `/skills/[skill]` | `/skills/typescript` | 3 |
| `/technologies/[tech]` | `/technologies/nextjs` | 3 |

### Auth (noindex)

| URL | robots |
|-----|--------|
| `/login` | noindex |
| `/register` | noindex |
| `/dashboard/*` | noindex |

---

## Structured Data (JSON-LD)

| Schema | Pages | Phase |
|--------|-------|-------|
| Organization | `/`, `/about` | 12 |
| JobPosting | `/jobs/[slug]` | 4 |
| BreadcrumbList | همه صفحات عمیق | 12 |
| WebSite + SearchAction | `/` | 12 |

---

## Technical SEO Checklist

| Item | Phase 0 | Target Phase |
|------|---------|--------------|
| `robots.txt` | ✅ | 12 update |
| `sitemap.xml` | ❌ referenced only | 12 |
| Canonical tags | ⚠️ metadataBase | 12 per-page |
| OpenGraph | ✅ root | 12 all public |
| Core Web Vitals | not measured | 12 |
| Image optimization | next/image | 4+ |

---

## Slug Conventions

- Persian slug transliteration یا English kebab-case — **تصمیم Phase 3**  
- Max length: 80 chars  
- Unique per entity type  

---

## Content Language

- Meta title/description: **فارسی**  
- `lang="fa"` + `dir="rtl"`  
- OpenGraph `locale`: `fa_IR`  

---

## References

- `.cto/SEO_RULES.md`
- `docs/phase-0/SEO_REVIEW.md`
- Master prompt SEO URL examples
