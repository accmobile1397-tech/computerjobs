# Phase 12 — CTO Handoff Package (SSR Public Pages)

**Prepared:** 2026-07-21 · **After:** Phase 11 tag `v0.12-phase-11` (D-065)  
**Status:** Spec preparation only — **implementation NOT authorized** · **no code · no migrations**

**Goal:** Enable CTO review and Phase 12 **specification planning** only.

---

## 1. Repository audit (current)

| Item | Value |
|------|-------|
| Branch | `main` |
| Phase 11 tag | ✅ `v0.12-phase-11` |
| Phase 10 tag | ✅ `v0.11-phase-10` |
| Tests | 270/270 (at Phase 11 close) |
| Live public SSR pages | **`/` only** |

### What Phase 11 delivered (consume — do not rebuild)

| Asset | Status |
|-------|--------|
| `src/modules/seo/` | ✅ metadata · canonical · urls · structured-data · sitemap · robots |
| `buildPageMetadata` | ✅ |
| JSON-LD builders | ✅ Org · WebSite · JobPosting · Breadcrumb (**no SearchAction**) |
| `app/sitemap.ts` | ✅ honest · `/` only · domain stubs `[]` |
| `app/robots.ts` | ✅ single SoT (C-011-5) |
| SEO_STRATEGY v1.1 | ✅ Phase 11/12 labels remapped |
| Hardening guards | ✅ `phase11-hardening.test.ts` |

### What does **not** exist yet (Phase 12 inventory)

| Asset | Status |
|-------|--------|
| `/jobs`, `/jobs/[slug]`, facet lists | ❌ |
| `/companies`, `/companies/[slug]` | ❌ |
| `/locations/**`, `/categories/**`, `/skills/**`, `/technologies/**` | ❌ |
| `/about` · `/contact` · `/terms` · `/privacy` | ❌ |
| Domain sitemap sources (non-empty) | ❌ stubs only |
| JobPosting / Breadcrumb **page** embeds | ❌ builders only |
| SearchAction on WebSite | ❌ deferred (C-011-4) until public search URL live |

**Implication:** Phase 12 is **page inventory + wiring**, not a second SEO architecture.

---

## 2. Architecture boundary (RFC-006 §11)

| Concern | Phase 11 | Phase 12 |
|---------|----------|----------|
| SEO builders · robots · honest sitemap core | ✅ done | consume |
| Public SSR pages · `generateMetadata` per route | — | ✅ |
| Expand sitemap domain sources | empty stubs | ✅ when pages live |
| Programmatic SEO lists | — | ✅ |
| Soft-404 sitemap entries | forbidden | still forbidden (C-011-2 spirit) |

**Hard rule:** Sitemap may only list URLs that **actually render**. No soft-404 inventory.

---

## 3. Open debt (non-blocking for Phase 12 spec)

| ID | Item | Phase 12 relevance |
|----|------|-------------------|
| TD-P10-2 | Admin Events Viewer UI | None |
| C-011-4 | SearchAction deferred | Add only when public search URL exists |
| Phase 6 formal close | Search tag pending | May inform search landing URLs later |

---

## 4. Does Phase 12 need a new RFC?

| Option | When |
|--------|------|
| **A — TECHNICAL_SPEC only** | Prefer if RFC-006 + SEO_STRATEGY already freeze contracts |
| **B — Short RFC addendum** | Only if CTO wants new frozen contracts (e.g. programmatic URL generation rules, caching) |

**Handoff recommendation:** **Option A** — Phase 12 TECHNICAL_SPEC consuming RFC-006 · SEO_STRATEGY URL map · existing `modules/seo` APIs.

---

## 5. Suggested Phase 12 MVP scope (for CTO selection)

### Option 1 — Core public inventory (recommended)

1. Static: `/about` · `/contact` · `/terms` · `/privacy`  
2. Jobs: `/jobs` list · `/jobs/[slug]` detail (+ JobPosting JSON-LD)  
3. Companies: `/companies` · `/companies/[slug]`  
4. Expand sitemap sources for **live** routes only  
5. BreadcrumbList on deep pages  

### Option 2 — Option 1 + taxonomy/location hubs

Add `/categories/**` · `/locations/**` · `/skills/**` · `/technologies/**` (+ programmatic job facets if ready).

### Option 3 — Minimal proof

Only `/jobs/[slug]` + sitemap entry for published jobs (faster SEO proof; incomplete map).

---

## 6. Prerequisites before Phase 12 implementation

1. CTO selects scope option (1 / 2 / 3)  
2. CTO decides TECHNICAL_SPEC-only vs RFC addendum  
3. CTO **APPROVE** Phase 12 TECHNICAL_SPEC  
4. Keep C-011-2 honesty · no UUID public paths · no Prisma in Client Components  

**Not required:** SearchAction · AI landings · Analytics (Phase 13).

---

## 7. Recommended CTO next actions

1. Review this handoff + [SEO_STRATEGY.md](../SEO_STRATEGY.md) + [RFC-006](../rfc/RFC-006-SEO-ARCHITECTURE.md)  
2. Choose **Option 1 / 2 / 3**  
3. Authorize drafting **Phase 12 TECHNICAL_SPEC** only  
4. **Do not** authorize coding until APPROVE  

---

## References

| Doc | Role |
|-----|------|
| [phase-11/PHASE_11_CLOSURE_REPORT.md](../phase-11/PHASE_11_CLOSURE_REPORT.md) | Prior phase closed |
| [RFC-006](../rfc/RFC-006-SEO-ARCHITECTURE.md) | SEO architecture SoT |
| [SEO_STRATEGY.md](../SEO_STRATEGY.md) | URL map |
| [ROADMAP.md](../ROADMAP.md) | Phase 12 = SSR Public Pages (D-046) |
| [AI_CTO_STATUS.md](../AI_CTO_STATUS.md) | Current handoff |

**Agent stop.** No Phase 12 implementation · no migrations · no code.
