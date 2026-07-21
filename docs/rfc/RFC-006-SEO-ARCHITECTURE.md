# RFC-006 — SEO Architecture

**Status:** 📝 **DRAFT — awaiting CTO APPROVE** (then FROZEN before Phase 11 implementation)  
**ID:** RFC-006 · **Decision:** _(pending — propose D-056 on APPROVE)_  
**Audience:** Public-web SEO foundation for ComputerJobs.ir  
**Depends on:** D-014 (`SEO_STRATEGY.md`) · `.cto/SEO_RULES.md` · RFC-001 product URL invariants · Phase 10 closed (`v0.11-phase-10`)  
**Blocks:** Phase 11 (SEO Foundation) · informs Phase 12 (SSR Public Pages) · extension for Phase 15 AI Landing Pages  

**Scope selection (CTO 2026-07-21):** Phase 11 = **Option 1 — SEO Foundation** only.

---

## 1. Purpose

Freeze **cross-cutting SEO contracts** before public SSR pages sprawl:

1. SEO module architecture  
2. Metadata builders  
3. Canonical policy  
4. Sitemap sources  
5. robots policy  
6. JSON-LD contracts  
7. URL normalization  
8. Public URL strategy  
9. Phase 11 / Phase 12 boundary  
10. Extension points for future AI Landing Pages  

**Non-goals of this RFC:** Implementing pages, migrations, analytics vendors, Core Web Vitals program, or Admin Events UI (TD-P10-2).

---

## 2. Principles

1. **Persian First · RTL · Mobile First** — meta copy fa-IR; `lang="fa"`; `og:locale=fa_IR`.  
2. **Readable public URLs** — slug paths only; **no raw UUID** in indexable URLs (RFC-001 / SEO_STRATEGY).  
3. **SSR/SSG for indexable surfaces** — client-only shells are not SEO SoT.  
4. **Every public page:** title · description · canonical · OpenGraph (SEO_RULES).  
5. **Feature-first module** — SEO logic lives in `src/modules/seo/` — **never** `src/lib/`.  
6. **Thin App Router adapters** — `sitemap.ts` / `robots.ts` / page `generateMetadata` call SEO module builders; no business rules inline.  
7. **Sitemap honesty** — only URLs that resolve to real, indexable responses.  
8. **Admin/auth stay private** — never in sitemap; always `noindex`.  
9. **Contracts before pages** — Phase 11 freezes builders; Phase 12 wires page inventory.  
10. **AI content is gateway-bound** — any future AI landing copy goes through RFC-002 AI Gateway; SEO module only consumes finalized fields.

---

## 3. SEO module architecture

### 3.1 Layout (frozen target)

```text
src/modules/seo/
  README.md
  metadata/           # title · description · OG · twitter · robots helpers
  canonical/          # absolute URL + query stripping rules
  urls/               # path builders · normalization · public route registry
  structured-data/    # JSON-LD builders (JobPosting · Organization · Breadcrumb · WebSite)
  sitemap/            # SitemapSource providers (static + domain adapters)
  robots/             # allow/disallow · sitemap URL policy
  types/              # shared DTOs (no Prisma types leaked to pages)
```

### 3.2 Dependency direction

```text
App Router (page · layout · sitemap.ts · robots.ts)
    ↓
modules/seo/*  (pure builders + thin data adapters)
    ↓
Domain modules (jobs · companies · taxonomy · location)  — read-only list/slug APIs
    ↓
DB
```

**Forbidden:**

- Prisma / DB clients inside React Client Components  
- Sitemap including `/admin/*`, `/api/*`, auth, dashboards  
- Hardcoded absolute production host outside `APP_URL` / `metadataBase`  
- UUID path segments on public SEO URLs  

### 3.3 Host / base URL

- Absolute URLs use `process.env.APP_URL` (fallback documented for local only).  
- Align with root `metadataBase` (Phase 0 MED-001 ops note).

---

## 4. Metadata builders

### 4.1 Contract

```ts
type SeoPageInput = {
  title: string;          // fa-IR, without site suffix if template applies
  description: string;    // fa-IR, ~120–160 chars guidance
  path: string;           // normalized path starting with /
  robots?: "index" | "noindex";
  openGraph?: { title?: string; description?: string; type?: string; images?: string[] };
};

// Output maps to Next.js Metadata (implementation reads Next 16 docs)
buildPageMetadata(input: SeoPageInput): Metadata
```

### 4.2 Rules

| Rule | Detail |
|------|--------|
| Title template | Prefer root layout `template: "%s \| ComputerJobs.ir"` |
| Description | Required for `index` pages; empty description forbidden for public index |
| OpenGraph | Always set `locale: fa_IR`; inherit siteName |
| Twitter | `summary_large_image` default |
| noindex pages | Must set `robots: { index: false, follow: false }` |

### 4.3 Phase 11 deliverable

Builders + unit tests for pure functions. Wiring on `/` and any **already-live** public routes only. Full page coverage → Phase 12.

---

## 5. Canonical policy

| Case | Canonical |
|------|-----------|
| Clean public path | `APP_URL + normalizedPath` |
| Tracking query (`utm_*`, `fbclid`, …) | Strip from canonical; keep path |
| Pagination (`?page=`) | Canonical = page 1 URL **or** self-canonical per page — **choose in TECHNICAL_SPEC**; default proposal: **self-canonical** with `rel` prev/next deferred to Phase 12 |
| Trailing slash | Normalize to **no trailing slash** except `/` |
| Case | Paths lowercase |
| Duplicate filters | Prefer one canonical filter order (documented in URL normalizer) |
| Unpublished / draft entity | **noindex** + omit from sitemap (do not invent soft URL) |

**Hard rule:** Canonical host must match production `APP_URL` in prod.

---

## 6. Sitemap sources

### 6.1 Interface

```ts
type SitemapEntry = {
  path: string;           // normalized, leading /
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;      // 0..1 advisory
};

interface SitemapSource {
  id: string;
  /** Only include URLs that are publicly live and indexable. */
  listEntries(): Promise<SitemapEntry[]>;
}
```

### 6.2 Phase 11 sources (MVP)

| Source id | Content |
|-----------|---------|
| `static-core` | `/` and other **already-rendered** public static paths only |
| _(optional stub)_ | Domain sources return `[]` until Phase 12 pages exist |

### 6.3 Phase 12+ sources (reserved)

| Source id | Content |
|-----------|---------|
| `jobs-public` | Published jobs by slug |
| `companies-public` | Verified/public companies by slug |
| `taxonomy` | categories · subcategories · skills · technologies |
| `locations` | provinces · cities |
| `programmatic-jobs` | `/jobs/{facet}` combinations that have real list pages |
| `ai-landings` | Future AI landing slugs (Phase 15) — empty until enabled |

### 6.4 Aggregation

- `collectSitemapEntries(sources)` de-dupes by `path`.  
- App Router `sitemap.ts` is thin: call collector → map to Next sitemap format.  
- Cap / chunking strategy if URL count grows — defer details to TECHNICAL_SPEC / TD if needed.

---

## 7. robots policy

### 7.1 Defaults

| Path pattern | Policy |
|--------------|--------|
| `/` and public marketing/content | Allow |
| `/admin`, `/admin/*` | Disallow + meta noindex |
| `/api/*` | Disallow |
| `/login`, `/register` | Disallow + meta noindex |
| `/dashboard`, `/dashboard/*` | Disallow + meta noindex |
| Future authenticated app areas | Disallow + noindex |

### 7.2 Sitemap advertisement

- `Sitemap:` line **must** point to a **working** sitemap endpoint.  
- Prefer App Router `robots.ts` generating rules from `modules/seo/robots` (may replace or supersede `public/robots.txt` — one SoT only).

### 7.3 Phase 11 deliverable

Single SoT robots config + consistent sitemap URL. Remove “dangling sitemap” gap from Phase 0 SEO review.

---

## 8. JSON-LD contracts

### 8.1 Builders (pure)

| Builder | Schema.org type | Consumed by |
|---------|-----------------|-------------|
| `buildOrganizationJsonLd` | Organization | `/`, `/about` (Phase 12 for about) |
| `buildWebSiteJsonLd` | WebSite (+ optional SearchAction) | `/` |
| `buildJobPostingJsonLd` | JobPosting | `/jobs/[slug]` (Phase 12 page) |
| `buildBreadcrumbJsonLd` | BreadcrumbList | Deep public pages (Phase 12) |

### 8.2 Rules

- Output valid JSON-LD object graphs; pages embed via `<script type="application/ld+json">` or Next pattern.  
- JobPosting fields must reflect **public** job data only (no contact unlock bypass — RFC-001).  
- Missing required entity fields → builder returns `null` (page may omit script; do not emit invalid schema).  
- Phase 11: **builders + tests**; Phase 12: wire on pages.

---

## 9. URL normalization

```ts
normalizePublicPath(input: string): string
```

Rules (frozen intent):

1. Ensure leading `/`  
2. Lowercase path segments  
3. Collapse duplicate slashes  
4. Strip trailing slash (except `/`)  
5. Reject / never emit paths with UUID-shaped segments for public SEO helpers  
6. Encode safely for Persian-capable path segments if used; prefer English kebab slugs already in taxonomy/location seeds  

Slug conventions remain as in SEO_STRATEGY (max 80; unique per entity type).

---

## 10. Public URL strategy

### 10.1 SoT

[SEO_STRATEGY.md](../SEO_STRATEGY.md) remains the **URL map catalog**. This RFC does **not** invent a second map.

### 10.2 Remap (architecture clarification)

Historical “Phase 4/6” labels in SEO_STRATEGY meant “after domain data exists.” **Rendering** of those URLs is **Phase 12** unless already live.

| Layer | Owner |
|-------|--------|
| URL patterns · slug rules | SEO_STRATEGY + this RFC |
| SEO builders · sitemap · robots | **Phase 11** |
| Page components · `generateMetadata` wiring · programmatic lists | **Phase 12** |

### 10.3 Auth / admin

| Pattern | Indexable? |
|---------|------------|
| `/admin/*` | No |
| `/login` · `/register` | No |
| `/dashboard/*` | No |
| `/api/*` | No |

---

## 11. Phase 11 / Phase 12 boundary

| Concern | Phase 11 (Foundation) | Phase 12 (SSR Public Pages) |
|---------|----------------------|-----------------------------|
| `modules/seo` skeleton | ✅ | consume |
| Metadata / canonical / OG builders | ✅ | wire per page |
| `sitemap.ts` + honest sources | ✅ (static/live only) | expand domain sources |
| robots SoT | ✅ | update allows if new public areas |
| JSON-LD builders | ✅ | embed on pages |
| `/jobs/[slug]`, `/companies/[slug]`, taxonomy/location pages | ❌ | ✅ |
| Static `/about` · `/contact` · `/terms` · `/privacy` | ❌ | ✅ |
| Core Web Vitals program | ❌ | ✅ (hardening) |
| Search Console / GTM automation | ❌ | Phase 13 |

**Hard stop:** Phase 11 must not ship soft-404 sitemap entries for pages that do not exist yet.

---

## 12. Extension points — AI Landing Pages (future)

Reserved for Phase 14/15 without blocking Phase 11:

| Extension | Intent |
|-----------|--------|
| `SitemapSource` id `ai-landings` | List published AI landing slugs |
| `buildAiLandingMetadata(input)` | Meta from finalized landing DTO |
| `PublicRouteRegistry` entry type `ai_landing` | Path pattern `/landings/[slug]` or CTO-approved prefix |
| Content provenance | Body/meta produced via **AI Gateway** (RFC-002); SEO never calls providers |
| Feature gate | `SystemSetting feature.ai_landings` or future TD-ADMIN-1 flag — not required in Phase 11 |

Phase 11 only: leave typed stubs / empty source — **no AI landing implementation**.

---

## 13. Security & abuse

- Do not expose private job/company/resume fields in meta or JSON-LD.  
- Rate-limit any future on-demand sitemap rebuild admin trigger (optional; Phase 12+).  
- No user-generated HTML in meta without sanitization.

---

## 14. Testing (architecture expectations)

| Layer | Expectation |
|-------|-------------|
| Unit | normalizePublicPath · canonical strip · JSON-LD builders · robots rules |
| Static guard | Client components under public UI must not import Prisma |
| Manual | `/sitemap.xml` 200 · robots Sitemap line matches |

HTTP E2E remains TD-P2-1.

---

## 15. Explicit non-goals

- Full public page inventory (Phase 12)  
- External SEO SaaS integrations  
- Automatic Search Console submission  
- TD-P10-2 Admin Events Viewer UI  
- Feature Flag Engine (TD-ADMIN-1)  
- Changing product slug algorithms mid-flight without taxonomy/location RFCs  

---

## 16. Relation to decisions / debt

| ID | Relation |
|----|----------|
| D-014 | SEO_STRATEGY SoT |
| D-046 | Phase 11 = SEO Foundation |
| D-055 | Phase 10 closed prerequisite |
| TD-P10-2 | Unrelated admin debt |
| TD-P2-1 | Optional later SEO smoke tests |

---

## 17. Rollout

1. CTO **APPROVE** (or APPROVE WITH CONDITIONS) this RFC → **FROZEN**  
2. Phase 11 TECHNICAL_SPEC APPROVE → implementation authorized  
3. Phase 12 consumes frozen builders  

**No coding until RFC FROZEN + Phase 11 TECHNICAL_SPEC APPROVE.**

---

## CTO Decision Log

| Date | Decision |
|------|----------|
| 2026-07-21 | Handoff APPROVED · Option 1 · **RFC-006 required before TECHNICAL_SPEC** |
| _(pending)_ | APPROVE / APPROVE WITH CONDITIONS / REJECT |

- [ ] APPROVE  
- [ ] APPROVE WITH CONDITIONS  
- [ ] REJECT  

**Next after APPROVE:** Freeze RFC-006 · review Phase 11 TECHNICAL_SPEC · only then authorize implementation.
