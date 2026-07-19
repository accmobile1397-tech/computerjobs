# Security Review — Phase 2: Profiles & Companies

**فاز:** 2 — Approved spec

---

## ۱. Threat Summary

| Threat | Mitigation |
|--------|------------|
| IDOR | authorization.service + membership checks |
| User/company slug squatting | reserved list; admin override |
| Slug enumeration | 404 for private/suspended/unverified |
| Invite token reuse | hash; single-use; 7-day expiry |
| XSS in bio | plain-text only Phase 2 |
| Open redirect | websiteUrl http/https only |
| Suspended company access | status check on all reads/writes |

---

## ۲. Avatar & Logo (CTO Condition 4)

| Rule | Detail |
|------|--------|
| Storage | URL string in DB only |
| Upload | **No upload logic Phase 2** |
| Validation | max length 512; https preferred |
| SSRF | do not fetch URL server-side Phase 2 |

---

## 3. Profile Visibility (CTO Condition 6)

| Visibility | Public endpoint `/profiles/by-slug/:slug` |
|------------|-------------------------------------------|
| PRIVATE | 404 |
| EMPLOYERS_ONLY | 403 unless EMPLOYER/ADMIN auth |
| PUBLIC | 200 if user ACTIVE + slug set |

---

## ۴. Company visibility

Public slug endpoint requires:

```text
verificationStatus = VERIFIED
status = ACTIVE
deletedAt IS NULL
```

`suspended` companies → 404 public; members may read internal API.

---

## ۵. Audit (CTO Condition 5)

Required events:

- PROFILE_UPDATED
- COMPANY_CREATED / UPDATED / DELETED
- MEMBER_INVITED / ACCEPTED / REMOVED
- OWNERSHIP_TRANSFERRED
- EMPLOYER_VERIFICATION_UPDATED
- COMPANY_VERIFICATION_UPDATED
- COMPANY_STATUS_CHANGED

---

## ۶. Verification workflow

Employer & company: PENDING → UNDER_REVIEW → VERIFIED | REJECTED  
Only admin can set UNDER_REVIEW, VERIFIED, REJECTED.

---

## ۷. Critical Findings

**None open.** Technical debt: 🟢 Low (CTO 2026-07-19).

Implementation requires Guardian re-review at phase end.
