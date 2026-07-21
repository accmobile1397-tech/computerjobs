# Phase 11 — Implementation Plan

**Spec:** [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) ✅ **APPROVE WITH CONDITIONS** (D-056)  
**Architecture:** [RFC-006](../rfc/RFC-006-SEO-ARCHITECTURE.md) ✅ **FROZEN**  
**Scope:** Option 1 — SEO Foundation  
**Prerequisites:** Phase 10 ✅ `v0.11-phase-10` (D-055)

**Implementation is AUTHORIZED under D-056 conditions (C-011-1..6).**  
**Current instruction:** prepare plan/tasks only — **do not start code until CTO says begin P11-001.**

Implement on `main` in **small commits**. Track progress in **[TASKS.md](./TASKS.md)**.

---

## Conditions (must not violate)

| ID | Rule |
|----|------|
| C-011-1 | RFC-006 FROZEN before code — ✅ |
| C-011-2 | Sitemap honesty — live indexable URLs only |
| C-011-3 | No new domain SSR pages in Phase 11 |
| C-011-4 | AI landings stubs only · no SearchAction until public search live |
| **C-011-5** | **Single robots SoT — prefer `app/robots.ts`** · remove conflicting `public/robots.txt` |
| **C-011-6** | **Self-canonical pagination** for Phase 11 |

**No Prisma migrations** for SEO MVP.

---

## Task ↔ plan step

| Task | Plan step |
|------|-----------|
| P11-001 | 1 — `seo` module skeleton + README |
| P11-002 | 2 — URL normalize + canonical (incl. C-011-6) |
| P11-003 | 3 — metadata builders |
| P11-004 | 4 — JSON-LD builders + unit tests |
| P11-005 | 5 — SitemapSource + `static-core` + `sitemap.ts` |
| P11-006 | 6 — robots SoT (`robots.ts`) · C-011-5 cutover |
| P11-007 | 7 — Wire `/` via builders (± Org/WebSite JSON-LD optional) |
| P11-008 | 8 — Remap SEO_STRATEGY phase labels (11/12) |
| P11-009 | 9 — Unit tests + Prisma-in-client guard |
| P11-010 | 10 — CTO_REPORT handoff |

---

## Commit sequence (recommended)

| # | Scope | Path |
|---|--------|------|
| 1 | Module skeleton · types · index exports | `src/modules/seo/` |
| 2 | `normalizePublicPath` · canonical absolute URL · utm strip · self-canonical page helper | `seo/urls` · `seo/canonical` |
| 3 | `buildPageMetadata` | `seo/metadata` |
| 4 | JSON-LD builders (Organization · WebSite **without SearchAction** · JobPosting · Breadcrumb) | `seo/structured-data` |
| 5 | `SitemapSource` · `static-core` · empty domain stubs · `app/sitemap.ts` | `seo/sitemap` · `src/app/sitemap.ts` |
| 6 | `seo/robots` · `app/robots.ts` · remove conflicting `public/robots.txt` | C-011-5 |
| 7 | Home page metadata (+ optional JSON-LD on `/`) | `src/app/page.tsx` / layout |
| 8 | Docs: SEO_STRATEGY phase column remap | `docs/SEO_STRATEGY.md` |
| 9 | Tests + static guards | `seo/*.test.ts` |
| 10 | Docs handoff | `CTO_REPORT.md` · `AI_CTO_STATUS.md` · `TASKS.md` |

---

## HARD RULES

1. **No** `src/lib/` for SEO code.  
2. **No** Prisma in Client Components.  
3. **No** UUID public SEO paths.  
4. **No** `/admin` · `/api` · auth in sitemap.  
5. **No** domain sitemap entries until Phase 12 pages exist.  
6. **C-011-5** robots: one SoT only.  
7. **C-011-6** pagination: self-canonical only.  
8. Read Next 16 docs under `node_modules/next/dist/docs/` before Metadata / sitemap / robots APIs.

---

## Done criteria

- [ ] `modules/seo` complete per RFC-006 layout  
- [ ] `/sitemap.xml` (or App Router equivalent) 200 · live URLs only  
- [ ] robots SoT = `robots.ts` · Sitemap line matches  
- [ ] Builders unit-tested  
- [ ] SEO_STRATEGY 11/12 labels updated  
- [ ] typecheck · tests green  
- [ ] No Prisma migration for SEO  
- [ ] CTO_REPORT ≤ 300 lines  

---

## Post-approve workflow

1. ✅ D-056 APPROVE WITH CONDITIONS  
2. Docs: IMPLEMENTATION_PLAN · TASKS · CTO_REPORT · AI_CTO_STATUS  
3. **Stop** until CTO authorizes **start P11-001**  
4. Implement P11-001 → P11-010 one task at a time  
5. Tag on formal Phase 11 close (separate decision)
