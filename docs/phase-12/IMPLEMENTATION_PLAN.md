# Phase 12 — Implementation Plan

**Spec:** [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) ✅ **APPROVE WITH CONDITIONS** (D-066 · C-012-1..10)  
**Architecture:** [RFC-006](../rfc/RFC-006-SEO-ARCHITECTURE.md) ✅ **FROZEN** — reuse only  
**Scope:** Option 1 — Core public inventory  
**Prerequisites:** Phase 11 ✅ `v0.12-phase-11` (D-065)

**Implementation is AUTHORIZED under D-066 conditions.**  
Implement on `main` in **small commits**. Track in **[TASKS.md](./TASKS.md)**.

---

## Conditions (must not violate)

| ID | Rule |
|----|------|
| C-012-1 | Spec APPROVED before code — ✅ (D-066) |
| C-012-2 | Sitemap honesty — no soft-404 |
| C-012-3 | No SearchAction · no AI landings |
| C-012-4 | No taxonomy/location hubs in Option 1 |
| C-012-5 | Reuse `modules/seo` — no new SEO architecture |
| C-012-6 | Public job/company data only (RFC-001) |
| **C-012-7** | **All public pages use `generateMetadata()` + Phase 11 builders** |
| **C-012-8** | **`/jobs/[slug]` · `/companies/[slug]` → `notFound()` if invalid/non-public** |
| **C-012-9** | **JobPosting JSON-LD only for PUBLISHED jobs** |
| **C-012-10** | **Public SSR only — no admin/dashboard/profile routes** |

---

## Task ↔ plan step

| Task | Plan step |
|------|-----------|
| P12-001 | Public `(public)` route group + shared layout shell |
| P12-002 | Static pages ×4 + `generateMetadata` |
| P12-003 | `/jobs` list |
| P12-004 | `/jobs/[slug]` + JobPosting (C-012-8/9) |
| P12-005 | `/companies` list |
| P12-006 | `/companies/[slug]` (C-012-8) |
| P12-007 | Breadcrumb wiring |
| P12-008 | Sitemap expand (live only) |
| P12-009 | Tests + guards |
| P12-010 | CTO_REPORT handoff |

---

## Commit sequence (recommended)

| # | Scope |
|---|--------|
| 1 | `(public)/layout` · shared header/footer · move `/` into group · `generateMetadata` on home |
| 2 | Static about/contact/privacy/terms |
| 3 | Jobs list |
| 4 | Job detail + JSON-LD |
| 5 | Companies list |
| 6 | Company detail |
| 7 | Breadcrumbs |
| 8 | Sitemap sources |
| 9 | Hardening tests |
| 10 | Docs handoff |

---

## HARD RULES

1. Reuse Phase 11 SEO builders — do not fork architecture.  
2. No Prisma in Client Components.  
3. No UUID public paths.  
4. No admin/dashboard/profile pages in this phase (C-012-10).  
5. Sitemap only live indexable URLs.  
6. Read Next 16 docs under `node_modules/next/dist/docs/` before App Router page APIs.

---

## Post-approve workflow

1. ✅ D-066 APPROVE WITH CONDITIONS  
2. IMPLEMENTATION_PLAN + TASKS updated  
3. Implement **P12-001** → stop for CTO review  
4. Continue P12-002… only when authorized per task
