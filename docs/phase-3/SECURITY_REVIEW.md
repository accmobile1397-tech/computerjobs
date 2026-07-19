# Security Review — Phase 3: Location & Taxonomy

**فاز:** 3 — Spec only

---

## ۱. Threat Summary

| Threat | Mitigation |
|--------|------------|
| Unauthorized taxonomy publish | `taxonomy:approve` permission; suggestion workflow |
| AI bypass publish | service layer rejects direct publish from AI source |
| Slug squatting / injection | `slug.util.ts`; reserved list; validation |
| IDOR on admin endpoints | RBAC + authorization.service |
| Mass enumeration | public read only active entities; 404 uniform |
| Official category deletion | `CATEGORY_OFFICIAL_PROTECTED` |
| Merge into wrong parent | validate parent chain + entityType match |

---

## ۲. AI Suggestion Security

| Rule | Detail |
|------|--------|
| AI never publishes | DB constraint + service: only admin approve transitions to entity |
| aiMetadata | JSON size limit; no secrets in metadata |
| Source field | server-set for AI stub — client cannot spoof ADMIN |
| Pending only | approve/reject/merge only when status=PENDING |

---

## ۳. Location Data Integrity

| Rule | Detail |
|------|--------|
| Seed immutability | provinces/cities from versioned seed — admin toggles isActive only |
| Cross-province city move | **not allowed** Phase 3 |
| Inactive locations | hidden from public API; existing FKs remain valid |

---

## ۴. Public Read APIs

| Rule | Detail |
|------|--------|
| No PII | location/taxonomy entities contain no user data |
| Cache | public responses cacheable (CDN future) |
| Rate limiting | deferred Phase 13 (CTO Phase 2 Condition 3) |

---

## ۵. Audit

All admin writes and suggestion state transitions must emit audit events per DATABASE_DESIGN §۶.

Phase 2 audit verification (CTO Condition 2) — integration test checklist in Phase 3 implementation.

---

## ۶. Migration Security

| Rule | Detail |
|------|--------|
| cityId FK | validate city exists + isActive on PATCH profile |
| categoryId FK | validate category exists + isActive on PATCH company |
| Label fallback | do not auto-guess user labels server-side without explicit backfill job |

---

## ۷. SEO / Metadata (deferred)

Profile and Company public metadata + JSON-LD — Phase 12 (CTO Phase 2 Condition 4).  
Phase 3 API returns slug + names sufficient for future SSR.
