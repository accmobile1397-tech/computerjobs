# Changelog

All notable changes to ComputerJobs.ir are documented here.

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
