# Phase 11 — CTO Handoff Package (SEO Foundation)

**Prepared:** 2026-07-21 · **After:** Phase 10 tag `v0.11-phase-10` (D-055)  
**Status:** Spec preparation only — **implementation NOT authorized** · **no code · no migrations**

**Goal:** Enable CTO review and Phase 11 **specification planning** only.

---

## 1. Repository audit (current)

| Item | Value |
|------|-------|
| Branch | `main` (pushed) |
| Phase 10 tag | ✅ `v0.11-phase-10` |
| Phase 9 tag | ✅ `v0.10-phase-9` |
| Tests | 216/216 pass (at Phase 10 close) |
| Live stack | IAM · Companies · Jobs APIs · Resumes · Search · Billing · Payments · AI · Events · Notifications · Admin UI |

### What exists for SEO today

| Asset | Status |
|-------|--------|
| Root `metadata` (title · description · OG · twitter · robots) | ✅ `src/app/layout.tsx` |
| `lang="fa"` · `dir="rtl"` · Vazirmatn | ✅ |
| `public/robots.txt` | ✅ Allow `/` · references sitemap |
| `sitemap.xml` | ❌ **missing** (robots points to it) |
| Public job/company/taxonomy **pages** | ❌ **not in App Router** (APIs exist; SSR pages are Phase 12) |
| Per-page `generateMetadata` / canonical | ❌ almost none (admin is `noindex`) |
| JSON-LD (JobPosting · Organization · Breadcrumb) | ❌ not implemented |
| SEO helpers module | ❌ none under `src/modules/` |
| URL map SoT | ✅ [SEO_STRATEGY.md](../SEO_STRATEGY.md) (D-014) |
| Rules | ✅ [.cto/SEO_RULES.md](../../.cto/SEO_RULES.md) |

**Implication:** Phase 11 is **foundation**, not full public SSR surface. Phase 12 owns bulk of indexable page rendering.

---

## 2. Open technical debt review

### P1 (carry)

| ID | Item | Phase 11 relevance |
|----|------|--------------------|
| TD-P2-1 | HTTP integration tests | Low — optional smoke for sitemap/robots later |
| TD-P5-1 | Application Resume Snapshot | None |
| TD-P6-2 | Search Rate Limiting | Low — public search SSR later |
| TD-P7A-4 · TD-P7B-1/2 | Billing/payment hardening | None |

### P2 (carry + SEO-adjacent)

| ID | Item | Phase 11 relevance |
|----|------|--------------------|
| **TD-P10-2** | Admin Events Viewer UI | None (admin) |
| TD-P10-1 | Admin route consolidation | None |
| TD-ADMIN-1 | Feature Flag Engine | None |
| TD-EVT-1 | Central Event Registry | None |
| TD-NOTIF-1/2 | WEBHOOK · Digest | None |
| TD-P6-1 | Advanced Search Engine | Medium — programmatic SEO filters later |

### Phase 6 formal close (D-037)

Still open — **not blocking** Phase 11 SEO foundation.

---

## 3. Dependency review

| Dependency | Needed for Phase 11? | Notes |
|------------|----------------------|-------|
| Phase 10 Admin closed | ✅ | Done (`v0.11-phase-10`) |
| Jobs · Location · Taxonomy data + slugs | ✅ | Already in DB/API — SEO reads slugs, does not redefine product rules |
| Public SSR pages (Phase 12) | ⚠️ Partial | Foundation can ship **without** all pages; sitemap may start sparse |
| Notifications / Billing / AI | ❌ | No direct SEO dependency |
| New npm packages | ❓ | Likely none for MVP (Next.js Metadata API + App Router sitemap) |
| External SEO SaaS | ❌ | Out of scope (no Ahrefs/Semrush integration in MVP) |

**Next.js note:** App Router Metadata / `sitemap.ts` / `robots.ts` are the natural fit — confirm against current Next 16 docs during spec (training data may lag).

---

## 4. Architecture impact analysis

### Proposed module placement (spec decision — not implemented)

```text
src/modules/seo/          # metadata builders · JSON-LD · URL helpers (no Prisma in UI)
  metadata/
  structured-data/
  sitemap/                # data providers for sitemap routes
src/app/sitemap.ts        # Next sitemap (thin)
src/app/robots.ts         # optional migrate from public/robots.txt
```

| Principle | Impact |
|-----------|--------|
| Feature-first modules | New `seo` module — **not** `src/lib/` |
| C-005-1 Admin | Admin remains `noindex`; SEO module must not leak admin URLs into sitemap |
| RFC-001 product rules | Slug URLs only for public entities — no raw UUID in public SEO URLs |
| Persian First | Meta copy fa-IR · `og:locale=fa_IR` |
| Separation from Phase 12 | Phase 11 = **platform + contracts**; Phase 12 = **page inventory + content** |

### Does Phase 11 need a new RFC?

| Option | When |
|--------|------|
| **A — No new RFC** | Treat [SEO_STRATEGY.md](../SEO_STRATEGY.md) + SEO_RULES as SoT; Phase 11 TECHNICAL_SPEC only (aligns with D-051 spirit for “main capabilities”) |
| **B — RFC-006 SEO Architecture** | If CTO wants frozen contracts for sitemap sources, JSON-LD schemas, canonical rules, and Phase 11 vs 12 boundary before any coding |

**Handoff recommendation:** Prefer **Option B (short RFC-006)** if Phase 11 will define cross-cutting contracts used by Phase 12–13; otherwise **Option A** with a tight TECHNICAL_SPEC + explicit Phase 12 deferrals.

---

## 5. Proposed scope options

### Option 1 — Minimal Foundation (recommended MVP)

**In scope:**

- `seo` module skeleton + pure helpers (title/description/canonical/OG builders)
- App Router `sitemap.ts` (static + known public routes; empty/partial dynamic OK)
- Fix robots ↔ sitemap consistency (`robots.ts` or keep `public/robots.txt`)
- JSON-LD **builders** (JobPosting · Organization · Breadcrumb) — **not** necessarily wired on all pages yet
- Document noindex policy: `/admin/*` · `/login` · `/register` · dashboards
- Update SEO_STRATEGY phase tags so Phase 11 vs 12 split is unambiguous

**Out of scope:**

- Full public SSR page set (`/jobs/[slug]`, `/companies/[slug]`, …) → **Phase 12**
- Core Web Vitals program → Phase 12+
- Analytics / GTM / Search Console automation → Phase 13
- TD-P10-2 Events UI · Feature Flag Engine

### Option 2 — Foundation + Job detail SEO slice

Option 1 **plus** one indexable job detail page with `generateMetadata` + JobPosting JSON-LD (requires Phase 12-ish SSR work early).  
**Risk:** Blurs Phase 11/12 boundary; only if CTO wants an earlier SEO proof.

### Option 3 — Spec-only gate (no implementation yet)

Authorize **RFC-006 and/or TECHNICAL_SPEC** only; no coding until APPROVE.  
**Fits** current instruction: handoff → CTO review → then spec.

---

## 6. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `robots.txt` references missing `sitemap.xml` | Med | Phase 11 must ship sitemap or stop advertising it |
| SEO_STRATEGY vs ROADMAP phase mismatch (items labeled “Phase 12” vs “Phase 11 SEO”) | Med | Spec must remap checklist |
| Shipping sitemap of URLs without real pages → soft-404s | High | Sitemap only includes **live** routes; expand in Phase 12 |
| Duplicate content (query params · pagination) | Med | Canonical rules in RFC/spec |
| Admin / auth indexed | Med | Explicit noindex + robots disallow |
| Next Metadata API drift | Low | Read `node_modules/next/dist/docs` during implement |
| Scope creep into full SSR | High | Hard Phase 12 cut line in APPROVE conditions |

---

## 7. Prerequisites before Phase 11 implementation

1. CTO chooses **scope option** (1 / 2 / 3)  
2. CTO decides **RFC-006 vs TECHNICAL_SPEC-only**  
3. CTO **APPROVE** Phase 11 TECHNICAL_SPEC (and RFC if required)  
4. Confirm production `APP_URL` / `metadataBase` ops note (Phase 0 MED-001)  
5. **Do not** start coding until APPROVE  

**Not required:** Phase 6 formal tag · TD-P10-2 · real Email/SMS vendors.

---

## 8. Recommended next CTO actions

1. Review this handoff + [SEO_STRATEGY.md](../SEO_STRATEGY.md) + [.cto/SEO_RULES.md](../../.cto/SEO_RULES.md)  
2. Decide: **RFC-006?** · **Option 1 vs 2**  
3. Authorize drafting **Phase 11 TECHNICAL_SPEC** only  
4. Do **not** authorize implementation until spec APPROVE  
5. Keep Phase 12 as SSR Public Pages owner for most indexable surfaces  

---

## 9. Reference docs

| Doc | Why |
|-----|-----|
| [ROADMAP.md](../ROADMAP.md) | Phase 11 = SEO Foundation (D-046) |
| [DECISIONS.md](../DECISIONS.md) | D-014 SEO_STRATEGY · D-055 Phase 10 closed · TD-P10-2 |
| [AI_CTO_STATUS.md](../AI_CTO_STATUS.md) | Current handoff |
| [phase-10/PHASE_10_CLOSURE_REPORT.md](../phase-10/PHASE_10_CLOSURE_REPORT.md) | Prior phase closed |
| [SEO_STRATEGY.md](../SEO_STRATEGY.md) | URL map SoT |
| [phase-0/SEO_REVIEW.md](../phase-0/SEO_REVIEW.md) | Baseline gaps |

---

**Agent stop.** No Phase 11 implementation · no migrations · no code.
