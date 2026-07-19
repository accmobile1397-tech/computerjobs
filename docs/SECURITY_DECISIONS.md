# Security Decisions Log — ComputerJobs.ir

ثبت تصمیم‌های امنیتی با تاریخ و rationale. برای ADRهای معماری بزرگ → `docs/adr/`.

| ID | Date | Decision | Status | Phase |
|----|------|----------|--------|-------|
| SEC-001 | 2026-07-19 | Secrets فقط در `.env` / OpenShip env — هرگز git | Active | 0 |
| SEC-002 | 2026-07-19 | Env validation با zod در `modules/shared/env` — fail fast | Active | 0 |
| SEC-003 | 2026-07-19 | CSP baseline در middleware — شامل `unsafe-inline`/`unsafe-eval` برای Next.js dev | Active | 0 |
| SEC-004 | 2026-07-19 | HSTS **defer** تا Phase 13 — نیاز HTTPS production فعال | Planned | 13 |
| SEC-005 | 2026-07-19 | CSRF protection **defer** تا Phase 13 | Planned | 13 |
| SEC-006 | 2026-07-19 | Rate limiting **defer** تا Phase 13؛ skeleton اختیاری Phase 1 | Planned | 13 |
| SEC-007 | 2026-07-19 | JWT + Refresh + RBAC — Phase 1 IAM | Planned | 1 |
| SEC-008 | 2026-07-19 | Password hashing: argon2 یا bcrypt — plain text ممنوع | Planned | 1 |
| SEC-009 | 2026-07-19 | API errors: envelope استاندارد — بدون stack trace | Active | 0 |
| SEC-010 | 2026-07-19 | Redis/MySQL production: internal Docker network فقط | Active | 0 |
| SEC-011 | 2026-07-19 | Audit logs برای security events — Phase 13–14 | Planned | 14 |
| SEC-012 | 2026-07-19 | Never log passwords, tokens, sensitive PII | Active | 0 |

---

## SEC-003: CSP Permissive (Phase 0)

**Context:** Next.js App Router نیاز به inline styles/scripts در build دارد.

**Decision:** CSP Phase 0:
```
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
```

**Review trigger:** Phase 13 Security Hardening — nonce-based CSP.

**Risk accepted until:** Production launch hardening.

---

## SEC-004: HSTS Deferred

**Context:** HSTS فقط معنی‌دار پس از HTTPS stable روی OpenShip.

**Decision:** Add `Strict-Transport-Security` in Phase 13 after SSL verified.

---

## SEC-007: IAM Architecture (Phase 1)

**Decision:**
- Access token: short-lived JWT
- Refresh token: httpOnly cookie یا secure storage
- RBAC: roles (job_seeker, employer, admin) + permissions table
- Module: `src/modules/auth/` + `src/modules/users/`

---

## How to Add

1. Add row to table above  
2. Add detail section if non-trivial  
3. Reference in phase `SECURITY_REVIEW.md` and `CTO_REPORT.md`
