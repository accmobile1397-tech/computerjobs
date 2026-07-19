# Security Review — Phase 1: IAM

**فاز:** 1 — Spec review (pre-implementation)

---

## ۱. Threat Model (STRIDE summary)

| Threat | Mitigation Phase 1 |
|--------|-------------------|
| Spoofing | JWT + refresh rotation |
| Tampering | HTTPS (OpenShip), signed JWT |
| Repudiation | audit_logs |
| Information disclosure | no stack traces, generic forgot-password |
| Denial of service | rate limit skeleton, account lock |
| Elevation of privilege | RBAC permission check every action |

---

## ۲. Password Security

| Requirement | Implementation |
|-------------|----------------|
| Hashing | argon2id (memory 64MB, time 3, parallelism 1) |
| Plain text | never stored/logged |
| Reset | one-time token, invalidate sessions |
| Change | requires current password |

**Decision ref:** SEC-008 in `docs/SECURITY_DECISIONS.md`

---

## ۳. Token Security

| Token | Storage client | Storage server |
|-------|----------------|----------------|
| Access JWT | memory / header | stateless |
| Refresh JWT | httpOnly Secure cookie | SHA-256 hash in DB |

- Refresh rotation on every use  
- Revoke on password reset / logout-all  
- Short access TTL (15 min) limits blast radius  

---

## ۴. Account Protection

| Control | Value |
|---------|-------|
| Max failed logins | 5 |
| Lock duration | 15 minutes |
| Status gate | PENDING/SUSPENDED/BANNED blocked |

---

## ۵. RBAC Security

- Permissions loaded at login into JWT  
- Admin permission changes → recommend session revoke  
- `super_admin` seeded with all permissions — protect seed email  
- No hardcoded role checks in routes — use `authorization.service`  

---

## ۶. 2FA (Schema only)

- `twoFactorEnabled`, `twoFactorSecret` on User  
- Secret encrypted at rest (Phase future — AES with env key)  
- **No API exposure Phase 1**  

---

## ۷. Out of Scope (confirmed)

| Item | Status |
|------|--------|
| OAuth / Social | ❌ Phase 1 |
| CSRF full | defer Phase 13 |
| HSTS | defer Phase 13 |
| Production rate limit | skeleton only |

---

## ۸. Audit Requirements

All auth events → `audit_logs` — no passwords, tokens, or reset links in metadata.

---

## ۹. Env Secrets

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800
SEED_SUPERADMIN_EMAIL=
SEED_SUPERADMIN_PASSWORD=  # dev only — not production
```

---

## ۱۰. CTO Checklist

- [ ] argon2id approved
- [ ] Refresh httpOnly cookie approved
- [ ] Lockout policy approved (5 / 15min)
- [ ] RBAC table design approved
- [ ] No OAuth Phase 1 confirmed

---

## ۱۱. References

- [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md)
- `.cto/SECURITY_RULES.md`
- `docs/SECURITY_DECISIONS.md`
