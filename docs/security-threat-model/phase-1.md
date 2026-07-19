# Security Threat Model — Phase 1: IAM

**Version:** 1.0  
**Phase:** Identity & Access Management

---

## 1. Scope

Authentication, authorization, user management, session tokens, password flows.

**Out of scope:** OAuth, SMS delivery, Phase 2+ features.

---

## 2. Attack Surface

| Surface | Exposure |
|---------|----------|
| POST /auth/register/* | Public |
| POST /auth/login | Public |
| POST /auth/refresh | Public (cookie/body) |
| POST /auth/forgot-password | Public |
| GET /auth/verify-email | Public |
| GET/PATCH /users/me | Authenticated |
| /admin/users/* | Admin permissions |

---

## 3. Threats & Mitigations

| Threat | Mitigation | Residual Risk |
|--------|------------|---------------|
| Credential stuffing | rate limit skeleton, account lock (5/15min) | Med — full rate limit Phase 13 |
| Password theft DB | argon2id hashing | Low |
| JWT theft | short access TTL, httpOnly refresh, rotation | Med — XSS steals access token |
| Refresh token replay | one-time rotation, hash storage | Low |
| Privilege escalation | DB-driven RBAC, no hardcoded roles | Low if enforced |
| Email enumeration | generic forgot-password response | Low |
| Brute force login | failedLoginAttempts + LOCKED status | Low |
| IDOR on /users/me | userId from JWT only | Low |
| CSRF on refresh cookie | SameSite=Strict; CSRF Phase 13 | Med |

---

## 4. Data Classification

| Data | Classification | Storage |
|------|----------------|---------|
| passwordHash | Sensitive | MySQL |
| refresh token | Secret | SHA-256 hash only |
| access JWT | Secret | client memory |
| twoFactorSecret | Sensitive | encrypted nullable |
| audit_logs | Internal | MySQL |

---

## 5. Residual Risks (Accepted Phase 1)

- CSP permissive (SEC-003)
- No HSTS (SEC-004)
- Rate limiting skeleton only (SEC-006)
- Phone login schema ready — not active
- 2FA fields — no flow

---

## 6. References

- [SECURITY_REVIEW.md](../phase-1/SECURITY_REVIEW.md)
- [SECURITY_DECISIONS.md](../SECURITY_DECISIONS.md)
