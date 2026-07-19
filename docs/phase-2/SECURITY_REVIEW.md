# Security Review — Phase 2: Profiles & Companies

**فاز:** 2 — Spec

---

## ۱. Threat Summary

| Threat | Mitigation |
|--------|------------|
| IDOR on company/profile | Authorization service + membership check on every `:id` route |
| Slug enumeration | Generic 404 for unverified/deleted public slug |
| Invite token reuse | Hash in DB; single-use; expiry 7 days |
| Privilege escalation (MEMBER→OWNER) | Only OWNER can PATCH roles; transfer explicit endpoint |
| Mass assignment | Zod schemas; whitelist fields per role |
| XSS in bio/description | Sanitize HTML or plain-text only (plain-text Phase 2) |
| Open redirect via websiteUrl | Allowlist http/https; block javascript: |

---

## ۲. Authorization Matrix

| Action | JOB_SEEKER | EMPLOYER (member) | ADMIN |
|--------|------------|-------------------|-------|
| Edit own job-seeker profile | ✅ | ❌ | ❌ |
| Edit own employer profile | ❌ | ✅ | ❌ |
| Create company | ❌ | ✅ (once) | ❌ |
| Edit company | ❌ | OWNER/ADMIN | ❌ |
| Public read company | ✅ slug | ✅ | ✅ |
| Verify company | ❌ | ❌ | ✅ |

All checks via DB permissions — no `if (role === 'employer')` in routes.

---

## ۳. Data Exposure

**Public company response:** name, slug, description, logoUrl, websiteUrl, employeeCountRange, industryLabel — **no** owner email, **no** member list.

**Profile visibility:**
- PRIVATE — only self
- EMPLOYERS_ONLY — authenticated EMPLOYER/ADMIN
- PUBLIC — authenticated users (or fully public per CTO)

---

## ۴. Audit

Log: PROFILE_UPDATED, COMPANY_*, MEMBER_*, INVITE_SENT, OWNERSHIP_TRANSFERRED.

Include `metadata`: `{ companyId, targetUserId }` — no PII in metadata.

---

## ۵. Rate Limits (skeleton)

| Endpoint | Limit |
|----------|-------|
| PATCH profile | 30/hour/user |
| POST company | 5/day/user |
| POST invite | 20/day/company |

Production enforcement Phase 13.

---

## ۶. Dependencies on Phase 1

- JWT validation unchanged
- Account must be ACTIVE for write operations
- SUSPENDED/BANNED → 403 on all writes

---

## ۷. Open Items for CTO

| # | Question | Default |
|---|----------|---------|
| Q1 | One company per employer Phase 2? | yes |
| Q2 | Public profile without login? | EMPLOYERS_ONLY minimum |
| Q3 | Company visible before VERIFIED? | no (404 public) |

---

## ۸. Critical Findings

**None open at spec stage.** Implementation must re-run Guardian review.
