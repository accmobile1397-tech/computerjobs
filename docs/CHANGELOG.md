# Changelog

All notable changes to ComputerJobs.ir are documented here.

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
