# Risks and Assumptions — Phase 1: IAM

**فاز:** 1 — Spec

---

## ۱. Assumptions

| ID | Assumption |
|----|------------|
| A-1 | Email delivery via queue stub acceptable until Phase 10 notifications |
| A-2 | Single SuperAdmin seed sufficient for Phase 1 admin ops |
| A-3 | Permissions in JWT acceptable; refresh required after role change |
| A-4 | Refresh token in httpOnly cookie — web-first; mobile may need body token later |
| A-5 | Persian error messages in API envelope |
| A-6 | No multi-tenant / organization hierarchy in Phase 1 |
| A-7 | `primaryType` enum acceptable (RBAC roles remain table-driven) |
| A-8 | MySQL + Redis available on VPS for rate limit counters |

---

## ۲. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | JWT permission stale after admin role change | Med | Med | Short access TTL; admin revoke sessions API |
| R2 | Refresh cookie CSRF | Med | High | SameSite=Strict; CSRF Phase 13 |
| R3 | Email enumeration via timing | Low | Med | Constant-time responses; generic messages |
| R4 | SuperAdmin seed credential leak | Low | Critical | env only; never commit; rotate on deploy |
| R5 | argon2 CPU cost under load | Med | Med | rate limit login; tune params |
| R6 | Over-permissive default employer/job_seeker roles | Med | Med | minimal permission seed; review in CTO |
| R7 | 2FA schema without encryption | Low | Med | document future SEC decision; nullable secret |
| R8 | Audit log volume | Low | Low | index + retention policy Phase 14 |

---

## ۳. Dependencies

| Dependency | Required for |
|------------|--------------|
| Phase 0 shared infra | prisma, redis, queue |
| OpenShip env secrets | JWT keys production |
| BullMQ worker | email jobs (can run in-process dev) |

---

## ۴. Open Questions for CTO

| # | Question | Default if no answer |
|---|----------|----------------------|
| Q1 | Refresh token: cookie-only or cookie + body? | cookie-only web |
| Q2 | Access TTL 15min OK? | yes |
| Q3 | Lockout: 5 attempts / 15 min OK? | yes |
| Q4 | Include minimal admin UI or API-only? | API-only |
| Q5 | argon2id vs bcrypt? | argon2id |

---

## ۵. Deferred Decisions

| Topic | Phase |
|-------|-------|
| OAuth providers | Not planned Phase 1 |
| 2FA implementation | Post Phase 1 |
| SMS phone verification | Phase 10 |
| Full rate limiting | Phase 13 |
| Session device fingerprint | Future |

---

## ۶. References

- [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md)
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md)
