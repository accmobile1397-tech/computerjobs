# SEO Module

Feature-first SEO builders per [RFC-006](../../../docs/rfc/RFC-006-SEO-ARCHITECTURE.md).  
**Never** put SEO logic in `src/lib/`.

**Phase:** 11 (SEO Foundation) · **Decision:** D-056 APPROVE WITH CONDITIONS (C-011-1..6)

## Layout

| Path | Purpose | Status |
|------|---------|--------|
| `metadata/` | title · description · OG · twitter · robots helpers | ✅ P11-003 |
| `canonical/` | absolute URL + query stripping · self-canonical pagination (C-011-6) | ✅ P11-002 |
| `urls/` | path builders · normalization · public route registry | ✅ P11-002 (normalize) |
| `structured-data/` | JSON-LD builders (JobPosting · Organization · Breadcrumb · WebSite) | ✅ P11-004 |
| `sitemap/` | `SitemapSource` providers (static + domain adapters) | ✅ P11-005 |
| `robots/` | allow/disallow · sitemap URL policy (C-011-5) | ✅ P11-006 · `app/robots.ts` SoT |
| `types/` | shared DTOs (no Prisma types leaked to pages) | P11-001+ |

## Rules

- Thin App Router adapters only (`sitemap.ts` · `robots.ts` · `generateMetadata`)
- Absolute URLs via `APP_URL` / `metadataBase`
- No Prisma in Client Components
- No `/admin` · `/api` · auth in sitemap
- Sitemap honesty (C-011-2) — live indexable URLs only

## Progress

| Task | Status |
|------|--------|
| P11-001 Skeleton + README | ✅ |
| P11-002 URL normalize + canonical (C-011-6) | ✅ |
| P11-003 Metadata builders | ✅ |
| P11-004 JSON-LD builders (no SearchAction · C-011-4) | ✅ |
| P11-005 SitemapSource + `sitemap.ts` (C-011-2) | ✅ |
| P11-006 robots SoT `robots.ts` (C-011-5) | ✅ |
| P11-007 Wire `/` metadata + Org/WebSite JSON-LD | ✅ |
| P11-008 Remap SEO_STRATEGY phase labels (11/12) | ✅ |
| P11-009..P11-010 | Not started — await CTO |
