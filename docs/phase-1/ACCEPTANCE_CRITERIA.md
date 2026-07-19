# Acceptance Criteria — Phase 1: IAM

**فاز:** 1  
**وضعیت:** Spec approval pending

---

## ۱. Documentation (Pre-Implementation)

- [ ] `TECHNICAL_SPEC.fa.md` — CTO approved
- [ ] `DATABASE_DESIGN.md` — CTO approved
- [ ] `API_DESIGN.md` — CTO approved
- [ ] `ARCHITECTURE.md`
- [ ] `SECURITY_REVIEW.md`
- [ ] `ACCEPTANCE_CRITERIA.md`
- [ ] `RISKS_AND_ASSUMPTIONS.md`

**Gate:** 🟢 Phase 1 Approved for Implementation

---

## ۲. Database

- [ ] Migration `phase1_iam` applies cleanly
- [ ] All tables have UUID PK + audit fields where applicable
- [ ] Roles, permissions, role_permissions seeded
- [ ] SuperAdmin seed user (env-driven)
- [ ] Soft delete on users, roles, permissions

---

## ۳. Registration

- [ ] POST `/auth/register/job-seeker` creates PENDING user + profile + role
- [ ] POST `/auth/register/employer` creates employer
- [ ] Duplicate email → 409
- [ ] Verification email queued (log/stub OK Phase 1)
- [ ] No tokens returned before email verified

---

## ۴. Email Verification

- [ ] Verify token activates user (ACTIVE)
- [ ] Expired/invalid token → error
- [ ] Resend verification rate limited

---

## ۵. Login & Tokens

- [ ] Login returns access JWT + refresh cookie
- [ ] PENDING user cannot login → EMAIL_NOT_VERIFIED
- [ ] Locked account → ACCOUNT_LOCKED
- [ ] Failed attempts increment; lock at 5
- [ ] Refresh rotates token
- [ ] Logout revokes refresh

---

## ۶. Password

- [ ] Forgot password always 200
- [ ] Reset with valid token works
- [ ] All sessions revoked on reset

---

## ۷. RBAC

- [ ] Permissions in JWT payload
- [ ] Protected route denies without permission → 403
- [ ] Admin suspend user works + audit
- [ ] Role assignment admin API works

---

## ۸. User Profile

- [ ] GET `/users/me` returns user + profile + roles
- [ ] PATCH `/users/me` updates displayName
- [ ] PATCH password requires current password

---

## ۹. Sessions

- [ ] GET `/auth/sessions` lists active sessions
- [ ] DELETE session revokes token
- [ ] Logout-all revokes all

---

## ۱۰. Audit

- [ ] LOGIN_SUCCESS, LOGIN_FAILED logged
- [ ] REGISTER, EMAIL_VERIFIED logged
- [ ] No secrets in audit metadata

---

## ۱۱. Security

- [ ] argon2 password hash verified
- [ ] No OAuth endpoints
- [ ] 2FA fields exist in schema — no public 2FA API
- [ ] Rate limit skeleton on login/register

---

## ₁₂. Code Quality

- [ ] Logic in `modules/auth` and `modules/users` only
- [ ] No business logic in API routes
- [ ] Conventional commits on `develop`
- [ ] CI green
- [ ] `CTO_REPORT.md` + `ARCHITECTURE_GUARDIAN.md` at phase end

---

## ۱۳. Definition of Done

Phase 1 **Done** when all §2–§12 pass + CTO final review via commit link on `develop`.

**Do NOT start Phase 2** without explicit approval.
