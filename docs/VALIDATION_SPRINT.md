# Validation Sprint — ComputerJobs.ir

**Prepared:** 2026-07-22 · **After:** [SYSTEM_VALIDATION_REPORT.md](./SYSTEM_VALIDATION_REPORT.md) · Phase 12 `v0.13-phase-12`  
**Nature:** Manual / staging checklist · **documentation only** · **no code · no Phase 13**  
**Baseline:** Automated suite **346/346** green (unit/service) — this sprint closes **integration / E2E gaps**

**Environment:** Seeded local or staging · `APP_URL` set · DB migrated + seeded · payment/AI stubs OK  

**How to use:** Run tracks in order **1 → 13**. Mark each case `PASS` / `FAIL` / `BLOCKED` / `N/A`. Failures → note ID + evidence; do not start Phase 13 implementation until P0 failures are triaged.

---

## Sprint board

| # | Track | Priority | Depends on | Status |
|---|--------|----------|------------|--------|
| 1 | Authentication | P0 | — | ☐ |
| 2 | RBAC | P0 | Auth | ☐ |
| 3 | Employer (company) | P0 | Auth + RBAC | ☐ |
| 4 | Job Publish | P0 | Employer | ☐ |
| 5 | Public Pages | P0 | Job Publish | ☐ |
| 6 | SEO | P0 | Public Pages | ☐ |
| 7 | Notifications | P1 | Auth (+ events) | ☐ |
| 8 | Payment | P1 | Employer / wallet | ☐ |
| 9 | Application | P1 | Job Publish + Resume | ☐ |
| 10 | Resume | P1 | Auth (seeker) | ☐ |
| 11 | Admin | P1 | Auth (admin) | ☐ |
| 12 | Performance | P2 | Public + API smoke | ☐ |
| 13 | Security | P0 | All critical paths | ☐ |

---

## 1. Authentication

| ID | Case | Expected | Result |
|----|------|----------|--------|
| A-01 | Register job-seeker | 201 · user created · seeker profile | ☐ |
| A-02 | Register employer | 201 · employer profile | ☐ |
| A-03 | Login valid credentials | Access + refresh tokens | ☐ |
| A-04 | Login invalid password | 401 · no tokens | ☐ |
| A-05 | Refresh access token | New access · refresh accepted | ☐ |
| A-06 | Logout | Session invalidated for token | ☐ |
| A-07 | Logout-all | All refresh sessions dead | ☐ |
| A-08 | Verify email (or seeded verified) | Account usable for protected routes | ☐ |
| A-09 | Forgot + reset password | New password works · old fails | ☐ |
| A-10 | Expired / malformed Bearer | 401 on protected route | ☐ |

---

## 2. RBAC

| ID | Case | Expected | Result |
|----|------|----------|--------|
| R-01 | Seeker calls `job:create` | Denied (403) | ☐ |
| R-02 | Employer creates job (after company) | Allowed | ☐ |
| R-03 | Non-admin hits `/admin` or admin API | Denied | ☐ |
| R-04 | Admin hits admin dashboard API | Allowed | ☐ |
| R-05 | Employer cannot manage other company | Denied / not found | ☐ |
| R-06 | Member role cannot transfer ownership | Denied | ☐ |
| R-07 | Seeker cannot list employer job applications as owner | Denied | ☐ |
| R-08 | Permission seed present on existing DB | `admin:*` · job/company perms exist after seed | ☐ |

---

## 3. Employer (company management)

| ID | Case | Expected | Result |
|----|------|----------|--------|
| E-01 | Create company | Company DRAFT/ACTIVE per rules · slug set | ☐ |
| E-02 | Update company profile | Fields persist | ☐ |
| E-03 | List mine (`/companies/mine`) | Owns company | ☐ |
| E-04 | Invite member · accept invite | Member appears | ☐ |
| E-05 | Update member role | Role updated within policy | ☐ |
| E-06 | Transfer ownership | New owner · old demoted | ☐ |
| E-07 | Admin verify company | `VERIFIED` | ☐ |
| E-08 | Admin set ACTIVE | Public-eligible with verify | ☐ |
| E-09 | Unverified company not public | `/companies/{slug}` 404 · not in public list | ☐ |

---

## 4. Job Publish

| ID | Case | Expected | Result |
|----|------|----------|--------|
| J-01 | Create job (draft) | Job created · not public | ☐ |
| J-02 | Update job | Fields persist | ☐ |
| J-03 | Publish with quota available | `PUBLISHED` · `publishedAt` · `expiresAt` | ☐ |
| J-04 | Publish without quota / entitlement | Billing/quota error · not published | ☐ |
| J-05 | Pause published job | Not on public list/detail | ☐ |
| J-06 | Resume paused job | Public again if still valid | ☐ |
| J-07 | Close job | Not public | ☐ |
| J-08 | Expired job | Public detail `notFound` · list excludes | ☐ |
| J-09 | Employer list mine | Sees own jobs all statuses | ☐ |

---

## 5. Public Pages

| ID | Case | Expected | Result |
|----|------|----------|--------|
| P-01 | `GET /` | Home SSR 200 | ☐ |
| P-02 | `/about` `/contact` `/privacy` `/terms` | 200 · RTL content | ☐ |
| P-03 | `/jobs` empty DB | Empty state · 200 | ☐ |
| P-04 | `/jobs` with published job | Job appears · link to slug | ☐ |
| P-05 | `/jobs/{slug}` published | Detail 200 · company/city visible | ☐ |
| P-06 | `/jobs/{bad}` | 404 | ☐ |
| P-07 | `/jobs` pagination `?page=2` | Page works or empty gracefully | ☐ |
| P-08 | `/companies` verified+active | Company listed | ☐ |
| P-09 | `/companies/{slug}` | Detail 200 | ☐ |
| P-10 | `/companies/{bad}` | 404 | ☐ |
| P-11 | Draft/paused job slug | 404 | ☐ |
| P-12 | Public pages no contact unlock data | No private contact fields | ☐ |

---

## 6. SEO

| ID | Case | Expected | Result |
|----|------|----------|--------|
| S-01 | Each public page has `<title>` / description | From `generateMetadata` | ☐ |
| S-02 | Canonical absolute URL | Matches `APP_URL` + path | ☐ |
| S-03 | `/jobs?page=2` canonical keeps `page=2` | C-011-6 | ☐ |
| S-04 | Job detail JobPosting JSON-LD | `@type=JobPosting` when fields sufficient | ☐ |
| S-05 | Job/company/static Breadcrumb JSON-LD | `BreadcrumbList` | ☐ |
| S-06 | No SearchAction anywhere | Absent in JSON-LD | ☐ |
| S-07 | `GET /robots.txt` | Disallow admin/api/login/register/dashboard · sitemap line | ☐ |
| S-08 | `GET /sitemap.xml` | Only live Option 1 URLs | ☐ |
| S-09 | Sitemap excludes admin/api/hubs/UUIDs | Honesty | ☐ |
| S-10 | Unpublished job not in sitemap | After regenerate | ☐ |

---

## 7. Notifications

| ID | Case | Expected | Result |
|----|------|----------|--------|
| N-01 | Trigger mapped domain event (e.g. application submitted) | Delivery row / in-app created | ☐ |
| N-02 | User inbox list | Sees notification | ☐ |
| N-03 | Mark read / unread count | Count updates | ☐ |
| N-04 | Preferences opt-out channel | Channel suppressed | ☐ |
| N-05 | Idempotent re-publish | No duplicate spam (gateway rules) | ☐ |
| N-06 | Admin templates/mappings read | Admin APIs 200 | ☐ |
| N-07 | Stub email/SMS | Logged/simulated · no crash | ☐ |

---

## 8. Payment

| ID | Case | Expected | Result |
|----|------|----------|--------|
| Pay-01 | Initiate payment (stub/sandbox) | Intent/session created | ☐ |
| Pay-02 | Success callback / webhook stub | Wallet/entitlement updated | ☐ |
| Pay-03 | Failed payment | No entitlement grant | ☐ |
| Pay-04 | Double webhook (replay) | Document behavior · note **TD-P7B-2** | ☐ |
| Pay-05 | Publish job after credit purchase | Quota allows publish | ☐ |
| Pay-06 | Reconciliation gap | Confirm **TD-P7B-1** still open · no silent assumption | ☐ |

---

## 9. Application

| ID | Case | Expected | Result |
|----|------|----------|--------|
| App-01 | Seeker applies to published job | Application created | ☐ |
| App-02 | Duplicate apply | Rejected per rules | ☐ |
| App-03 | Apply to non-public job | Rejected | ☐ |
| App-04 | Withdraw application | Status withdrawn | ☐ |
| App-05 | Employer lists applications | Sees applicants | ☐ |
| App-06 | Employer updates status (viewed/reject/…) | Status persists | ☐ |
| App-07 | Resume snapshot | Note **TD-P5-1** if snapshot missing | ☐ |

---

## 10. Resume

| ID | Case | Expected | Result |
|----|------|----------|--------|
| Res-01 | Seeker create/get resume | One resume per user | ☐ |
| Res-02 | Update sections | Persists within caps | ☐ |
| Res-03 | Second resume create | Rejected (invariant) | ☐ |
| Res-04 | No file upload path | No upload endpoint success | ☐ |
| Res-05 | Contact hidden until unlock | Employer without unlock cannot see contact | ☐ |
| Res-06 | After contact unlock (if billing allows) | Contact visible per RFC-001 | ☐ |

---

## 11. Admin

| ID | Case | Expected | Result |
|----|------|----------|--------|
| Adm-01 | `/admin` shell loads for admin | 200 RTL | ☐ |
| Adm-02 | Dashboard metrics API | 200 | ☐ |
| Adm-03 | Audit viewer | Lists entries · pagination | ☐ |
| Adm-04 | Settings read/update | Persists | ☐ |
| Adm-05 | Monitoring endpoint | 200 | ☐ |
| Adm-06 | Notifications admin (templates/mappings/deliveries) | Read/manage per perms | ☐ |
| Adm-07 | Company verification/status admin APIs | Works (ties to E-07/E-08) | ☐ |
| Adm-08 | Events viewer UI | Expect gap **TD-P10-2** · API may work · UI incomplete | ☐ |
| Adm-09 | Non-admin UI/API | Blocked | ☐ |

---

## 12. Performance

| ID | Case | Expected | Result |
|----|------|----------|--------|
| Perf-01 | `/jobs` cold load | Acceptable TTFB for staging (&lt; target TBD · record ms) | ☐ |
| Perf-02 | `/jobs/{slug}` | Record TTFB | ☐ |
| Perf-03 | `/sitemap.xml` with N jobs | Completes · no timeout | ☐ |
| Perf-04 | Public list page=1 default limit | ≤20 items · stable | ☐ |
| Perf-05 | Admin dashboard | Record load time | ☐ |
| Perf-06 | No N+1 obvious on job list (spot-check logs/queries) | Notes only | ☐ |

*Targets:* set staging SLOs later; this track is **observe + record**, not optimize (no code in sprint).

---

## 13. Security

| ID | Case | Expected | Result |
|----|------|----------|--------|
| Sec-01 | IDOR: employer A job ID as employer B | Denied | ☐ |
| Sec-02 | IDOR: application of another seeker | Denied | ☐ |
| Sec-03 | UUID in public SEO path | Not in sitemap · normalize rejects | ☐ |
| Sec-04 | Admin/API paths not in sitemap | Absent | ☐ |
| Sec-05 | robots disallow honored for private prefixes | Present | ☐ |
| Sec-06 | XSS smoke on job title/description public page | Escaped · no script exec | ☐ |
| Sec-07 | Auth cookies/tokens not leaked to public HTML | No secrets in SSR | ☐ |
| Sec-08 | Rate-limit awareness on search | Note **TD-P6-2** if absent | ☐ |
| Sec-09 | Webhook authenticity | Note **TD-P7B-2** if weak | ☐ |
| Sec-10 | Contact unlock boundary | Locked contact not on public job/company pages | ☐ |

---

## Exit criteria

| Gate | Rule |
|------|------|
| **P0 tracks** | Auth · RBAC · Employer · Job Publish · Public Pages · SEO · Security — all critical cases PASS or waived in writing |
| **P1 tracks** | Failures logged as bugs/debt · no silent ignore |
| **Automated** | `npm test` still green before/after sprint |
| **Phase 13** | Still **not authorized** for implementation until CTO APPROVE of Phase 13 spec |

---

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Executor | | | |
| Reviewer (CTO) | | | |

**Related:** [SYSTEM_VALIDATION_REPORT.md](./SYSTEM_VALIDATION_REPORT.md) · [ROADMAP.md](./ROADMAP.md) debt · [phase-13/PHASE_13_CTO_HANDOFF.md](./phase-13/PHASE_13_CTO_HANDOFF.md)
