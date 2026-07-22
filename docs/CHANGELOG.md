# Changelog

All notable changes to ComputerJobs.ir are documented here.

## [0.11.0-10] — 2026-07-21 — Phase 10 Admin Platform

### Added

- Admin module (`permissions` · `services` · `ui`) · RTL Persian admin shell `/admin`
- Platform APIs: dashboard · audit · events · settings · monitoring
- DomainEventLog append-only persistence on EventBus publish (C-010-5)
- Admin UI: dashboard · audit · settings · monitoring · notifications (templates/mappings/deliveries/inbox)
- IAM: full `admin:*` namespace seed + legacy aliases (C-010-3)
- Hardening: C-005-1 static guard · thin platform routes · inbox RO (C-009-6)

### CTO

- Spec: **APPROVE WITH CONDITIONS** (D-054)
- Closure: **APPROVE WITH CONDITIONS** (D-055 · **C-P10-1**)
- **Tag recommendation:** `v0.11-phase-10`
- Debt: **TD-P10-2** Admin Events Viewer UI completion · TD-P10-1 · TD-ADMIN-1
- Ops: existing DBs re-run `npm run db:seed` for `admin:*` ([MIGRATION.md](./MIGRATION.md))

## [0.10.0-9] — 2026-07-21 — Phase 9 Notification System

### Added

- EventBus (in-memory) + event catalog v1 + `EVENTS.*` constants
- Publishers: `payment.succeeded` · `job.application.submitted`
- Notification Gateway (idempotency · preferences · correlationId)
- Providers: Email/SMS stub · InApp inbox
- Handlers → gateway (6 MVP events)
- User APIs: inbox · preferences · unread count
- Admin APIs: templates · mapping · deliveries · read-only inbox
- IAM: `notifications:read:own` · `preferences:own` · `admin` (D-052)

### CTO

- **APPROVE WITH CONDITIONS** at closure (D-053 · C-P9-1..3)
- **Tag:** `v0.10-phase-9`
- Ops: existing DBs re-run `npm run db:seed` for notification permissions
- Debt: TD-NOTIF-1 · TD-NOTIF-2

## [0.9.0-8] — 1404/04/29 — Phase 8 AI Gateway & Features

### Added

- AI Gateway (`complete` / estimate / moderate / routing / rate-limit)
- Providers: stub · openrouter · gemini (HTTP adapters)
- Features: `ai.match.explain` · `ai.job.improve_description`
- Prompt registry · wallet RESERVE/CAPTURE for AI_CREDIT
- APIs under `/api/v1/ai/*`

### CTO

- **APPROVE** — Phase 8 closed
- Tag: `v0.9-phase-8`
- Debt: TD-P8-1 Local provider

## [Unreleased]

### Phase 12 — SSR Public Pages

- **D-076 CLOSED** · tag ✅ `v0.13-phase-12`
- Option 1: static · `/jobs` · `/jobs/[slug]` · `/companies` · `/companies/[slug]`
- SEO: metadata · canonical · JobPosting · Breadcrumb · honest sitemap (RFC-006 reuse)
- Excluded: SearchAction · AI landings · taxonomy/location hubs · programmatic SEO
- Hardening: P12-009 guards · C-012-1..10 ✅
- Closure: [PHASE_12_CLOSURE_REPORT.md](./phase-12/PHASE_12_CLOSURE_REPORT.md)

### Phase 11 — SEO Foundation

- **D-065 CLOSED** · tag ✅ `v0.12-phase-11`
- RFC-006 FROZEN · C-011-1..6 satisfied · P11-001…P11-010 DONE
- Closure: [PHASE_11_CLOSURE_REPORT.md](./phase-11/PHASE_11_CLOSURE_REPORT.md)

### Phase 10 closed

- **D-055** CLOSED · tag ✅ `v0.11-phase-10`
- Condition **C-P10-1** → **TD-P10-2** (Events Viewer UI) — Phase 10 not reopened

---

## Older entries
### RFC-003 / 004 / 005 — CLOSED (2026-07-20)

- RFC-003 APPROVE WITH CONDITIONS · C-003-1 versioning · TD-EVT-1
- RFC-004 APPROVE · WEBHOOK reserved · TD-NOTIF-1
- RFC-005 APPROVE WITH CONDITIONS · C-005-1 UI→API · TD-ADMIN-1
- D-051: core architecture stack complete through Phase 10
- **Next:** Phase 9 TECHNICAL_SPEC

## [0.8.0-7B] — 1404/04/29 — Phase 7B Payment Gateway

### Added

- Payment + PaymentAttempt (status lifecycle PENDING→…→REFUNDED)
- PaymentProvider abstraction (`stub` via `activePaymentProvider`)
- Checkout / return (read-only) / webhook settle (idempotent)
- Reserved refundAmount, refundedAt; audit PAYMENT_SETTLED
- `docs/billing/BILLING_AUDIT_MODEL.md`
- `docs/security/PAYMENT_SECURITY_CHECKLIST.md`

### CTO

- **APPROVE WITH CONDITIONS** — Phase 7B closed
- Tag: `v0.8-phase-7B`
- Debt: TD-P7B-1 Reconciliation, TD-P7B-2 Replay protection, TD-P7B-3 Multi-PSP failover

### Next

- RFC-002 CLOSED · tag `v0.8-ai-rfc`
- Phase 8 CLOSED · `v0.9-phase-8`

## [0.7.0-7A] — 1404/04/29 — Phase 7A Entitlements

### Added

- Data-driven plans, PlanFeature versioning, PlanPrice (amount + currency)
- Subscription + SubscriptionHistory, wallet, QuotaUsage, SystemSetting
- ContactUnlock (unique companyId + targetUserId)
- Quota gates on apply / job publish; admin billing API
- Migration `20260719230000_phase7a_billing_entitlements`
- Audit catalog: `docs/phase-7/AUDIT_EVENT_CATALOG.md`

### CTO

- **APPROVE WITH CONDITIONS** — Phase 7A closed
- Tag: `v0.7-phase-7A`
- Debt: TD-P7A-1 Cache, TD-P7A-2 Analytics, TD-P7A-3 Feature flags, TD-P7A-4 AI credit stress

### Phase 7B

- Spec generated — Payment Gateway Integration — **CLOSED** (`v0.8-phase-7B`)

## [Unreleased] — RFC-001

### RFC-001

- Product Rules & Monetization — **APPROVE WITH CONDITIONS**
- Data-driven entitlements; Admin-configurable plans/quotas/prices
- Product invariants frozen (single resume, no upload, contact unlock, verified company, MatchScore not persisted, visibility model)
- Docs: `docs/rfc/RFC-001-PRODUCT-RULES.md`, `docs/rfc/RFC-001-MONETIZATION.md`

### Phase 7

- TECHNICAL_SPEC APPROVE WITH MINOR CONDITIONS — split **7A** (entitlements) / **7B** (PSP)
- 7A implementing: plans, quotas, wallet, ContactUnlock — no payment gateway

## [0.6.0] — 1404/04/29 — Phase 5 Resume Builder

### Added

- Resume builder — one resume per user; sections (education, experience, skills, technologies, languages, certificates, projects)
- ResumeStatus DRAFT/ACTIVE; visibility PUBLIC/EMPLOYERS_ONLY/PRIVATE
- User-owned slug public resume; employer applicant resume API
- Application `resumeId` auto-link on apply
- Reserved nullable: profileStrength, aiSummary, aiKeywords (unused)
- Migration `20260719220000_phase5_resume_builder`
- 25 unit tests; CI green

### CTO

- **APPROVE** — Phase 5 closed
- Tag: `v0.6-phase-5`
- Debt: TD-P5-1 Application Resume Snapshot (P1)

### Phase 6

- Spec generated — **awaiting CTO review** (no implementation)
- Scope: Job Search, Resume Search, Filters, Rule-Based Matching, Match Score
- Excluded: LLM, Agents, RAG, Prompting, AI Recommendations

## [0.5.0] — 1404/04/29 — Phase 4 Jobs Core

### Added

- Jobs module — CRUD, lifecycle (DRAFT → PENDING_REVIEW → PUBLISHED), slug
- Public job list/detail APIs with filters (incl. experienceLevel)
- Job applications foundation — apply, withdraw, employer manage, VIEWED status
- SalaryType enum; reserved isRemote, isUrgent, isFeatured fields
- Admin job approval endpoint
- Migration `20260719200000_phase4_jobs_core`
- 19 unit tests; CI green

### CTO

- **APPROVE** — Phase 4 closed
- Tag: `v0.5-phase-4`

### Phase 5

- Spec package generated — **awaiting CTO review** (no implementation)
- Scope: Resume Builder, Education, Experience, Skills, Technologies, Languages, Certificates, Projects, Candidate Resume Visibility

## [0.4.0] — 1404/04/29 — Phase 3 Location & Taxonomy

### Added

- Location module — 31 provinces + 431 cities seed
- Taxonomy — Category, SubCategory, Skill, Technology + aliases, popularityScore
- AI suggestion + admin approval workflow
- Public location/taxonomy read APIs
- `cityId` on job seeker profile, `categoryId` on company
- Migration `20260719180000_phase3_location_taxonomy`
- 16 unit tests; CI green

### CTO

- **APPROVE** — Phase 3 closed
- Tag: `v0.4-phase-3`

### Phase 4

- Spec package generated — **awaiting CTO review** (no implementation)
- Scope: Jobs Core, Lifecycle, Slug, Public APIs, Filtering, Application Foundation

## [0.3.0] — 1404/04/29 — Phase 2 Profiles & Companies

### Added

- User profiles & company management on `main`
- `users.slug`, job-seeker/employer profiles, completion score
- Company CRUD, members, invites, ownership transfer
- Admin verification/status endpoints
- Public profile + company slug endpoints
- Migration `20260719160000_phase2_profiles_companies`
- 11 unit tests; CI green

### CTO

- **APPROVE WITH CONDITIONS** — Phase 2 closed
- Tag: `v0.3-phase-2`
- Conditions: integration tests + audit verification before Phase 3 close; rate limiting + SEO metadata deferred

## [0.2.0] — 1404/04/29 — Phase 1 IAM

### Added

- Identity & Access Management (IAM) on `main`
- Auth: register (job-seeker/employer), login, refresh, logout, password reset, email verify
- Authorization module — DB-driven RBAC (ADR-0006)
- Users module — GET/PATCH `/users/me`
- Prisma migration `20260719140000_phase1_iam`
- Seed: roles, permissions, SuperAdmin
- Company + CompanyMember skeleton
- 5 unit tests; CI green
- Threat model Phase 1

### CTO

- **APPROVE WITH CONDITIONS** — Phase 1 closed
- Tag: `v0.2-phase-1`
- Conditions: shared migration continues; taxonomy/location skeletons remain planned

## [0.1.2] — 1404/04/29

### Phase 0 CTO Closeout

- CTO APPROVE WITH CONDITIONS (9.5/10) — all conditions met
- Added docs/SECURITY_DECISIONS.md, docs/SEO_STRATEGY.md
- Added ADR-0005-taxonomy, docs/rfc/payments.md
- Added Architecture Guardian role + docs/reviews/ARCHITECTURE_GUARDIAN.md
- Added modules/users, shared/config

## [0.1.1] — 1404/04/29

### Phase 0 Closeout — CTO Conditions

- Refactor to `src/modules/` feature-first architecture
- Migrate infrastructure to `src/modules/shared/`
- AI, taxonomy, location module skeletons with subfolders
- Split `.cto/RULEBOOK` into specialized rule files
- Added `docs/adr/`, `docs/rfc/`, `docs/DECISIONS.md`
- Created `develop` branch workflow
- Phase 1 renamed to Identity & Access Management (IAM)

## [0.1.0] — 1404/04/28

### Phase 0: Foundation & Architecture

#### Added
- Next.js App Router scaffold با TypeScript و TailwindCSS v4
- پشتیبانی RTL فارسی (Vazirmatn) و metadata SEO پایه
- shadcn/ui Button component
- Prisma ORM v6 setup با MySQL 8
- Redis client + BullMQ queue skeleton
- S3/MinIO storage stub
- Health endpoints: `/api/v1/health`, `/api/v1/health/deep`
- Security headers middleware
- Structured logging با pino
- Env validation با zod
- Docker Compose: MySQL, Redis, MinIO
- BullMQ worker Dockerfile skeleton
- GitHub Actions CI pipeline
- مستندات فارسی Phase 0
- استقرار VPS واحد با OpenShip (self-hosted)

#### Out of Scope (فازهای بعد)
- Authentication / RBAC
- Location system
- Taxonomy engine
- Job posting, resume, search
- AI Gateway
- Payments, notifications, ads
