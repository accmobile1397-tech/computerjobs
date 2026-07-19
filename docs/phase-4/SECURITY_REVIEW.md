# Security Review — Phase 4: Jobs Core

**فاز:** 4 — Spec only

---

## ۱. Threat Summary

| Threat | Mitigation |
|--------|------------|
| IDOR on jobs | company membership + `job:read:own` |
| IDOR on applications | job seeker owns application; employer owns job's company |
| Publish unverified company jobs | `verificationStatus=VERIFIED` + `status=ACTIVE` check |
| Slug enumeration draft jobs | public 404 for non-PUBLISHED |
| XSS in description | plain text Phase 4; sanitize on input |
| Salary scraping | `showSalary=false` hides amounts in public API |
| Application spam | one application per user per job; rate limit future |
| Fake apply as employer | `primaryType=JOB_SEEKER` + `job:apply` |

---

## ۲. Public Job Data

Public response excludes:
- internal UUIDs in URLs (slug-only for SEO pages)
- `createdById`, draft notes
- salary when `showSalary=false`

---

## ۳. Lifecycle Security

| Transition | Check |
|------------|-------|
| publish | company verified, member OWNER/ADMIN |
| pause/close | company member with `job:update:own` |
| apply | job PUBLISHED, user ACTIVE job seeker |

---

## ۴. Audit

All lifecycle and application status changes logged (DATABASE_DESIGN §۷).

---

## ۵. Deferred

- Rate limiting apply endpoint — Phase 13
- Resume virus scan — Phase 5
- Payment fraud — Phase 7
