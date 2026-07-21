# ComputerJobs.ir

پلتفرم استخدام **AI-Native** برای متخصصان فناوری در ایران — مهندسان نرم‌افزار، هوش مصنوعی، DevOps، امنیت سایبری و بیشتر.

**زبان:** فارسی (RTL) | **Mobile First** | **SEO First**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes |
| Database | MySQL 8 + Prisma ORM |
| Cache / Queue | Redis 7 + BullMQ |
| Storage | MinIO (S3-compatible) |
| Deployment | **OpenShip (self-hosted VPS)** + Docker Compose |
| CI | GitHub Actions |

---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

---

## Local Development

```bash
# 1. Clone & install
git clone https://github.com/accmobile1397-tech/computerjobs.git
cd computerjobs
npm install

# 2. Environment
cp .env.example .env

# 3. Start infrastructure
cd docker
cp .env.example .env
docker compose up -d
cd ..

# 4. Database migration
npm run db:migrate

# 5. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Health Checks

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/health/deep
```

---

## Deployment (OpenShip VPS)

استقرار production روی **VPS واحد** با OpenShip self-hosted:

1. سرویس‌های MySQL، Redis، MinIO را با Docker Compose بالا بیاورید
2. مخزن GitHub را در OpenShip connect کنید
3. Environment variables را در dashboard تنظیم کنید
4. دامنه + SSL خودکار

راهنمای کامل: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## Git Workflow

```text
main  ← all phase work (direct commits)
```

## Module Structure

```text
src/modules/
  shared/       # env, logger, prisma, redis, queue, storage
  auth/         # Phase 1 IAM
  location/     # province, city, seed
  taxonomy/     # category, subcategory, skill, technology, approval, suggestion
  ai/           # gateway, providers, health, prompts, token, fallback, queue, matching
  jobs/ resumes/ companies/ search/ payments/ notifications/ advertisements/ admin/
```

## Documentation

| Document | Description |
|----------|-------------|
| [.cto/RULEBOOK.md](.cto/RULEBOOK.md) | **CTO rules index** |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Project roadmap (SoT) |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decision log |
| [docs/AI_CTO_STATUS.md](docs/AI_CTO_STATUS.md) | **Current project status** |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| [docs/rfc/](docs/rfc/) | Feature RFCs |
| [docs/phase-9/PHASE_9_FINAL_REPORT.md](docs/phase-9/PHASE_9_FINAL_REPORT.md) | Phase 9 — final report |
| [docs/phase-10/PHASE_10_CLOSURE_REPORT.md](docs/phase-10/PHASE_10_CLOSURE_REPORT.md) | Phase 10 — closure (D-055) |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | OpenShip VPS deployment |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Prisma migrations & seed |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Changelog |

---

## Phase Status

**Roadmap SoT:** [docs/ROADMAP.md](docs/ROADMAP.md)

| Phase | Scope | Status |
|-------|--------|--------|
| 0–5 | Foundation → Resume | Closed (`v0.2`–`v0.6`) |
| 6 | Search & Matching | Implemented · formal close pending |
| 7A–7B | Entitlements · Payments | Closed (`v0.7`–`v0.8`) |
| 8 | AI Gateway & Features | Closed (`v0.9-phase-8`) |
| **9** | **Notification System** | **Closed** (`v0.10-phase-9`) |
| **10** | **Admin Platform** | **Closed** (`v0.11-phase-10`) |
| **11** | **SEO Foundation** | Handoff ready · **not authorized** |
| 12–15 | SSR · Analytics · … | Planned |

**Capabilities live:** Auth · RBAC · Companies · Jobs · Resumes · Search · Billing · Payments · AI · Events · Notifications · **Admin**.

**Next:** [docs/phase-11/PHASE_11_CTO_HANDOFF.md](docs/phase-11/PHASE_11_CTO_HANDOFF.md) — CTO review for Phase 11 **spec planning** only.

---

## CTO Review Process

1. Agent reads [`.cto/RULEBOOK.md`](.cto/RULEBOOK.md) before each phase
2. Spec → CTO APPROVE → implement → `CTO_REPORT` / closure report
3. Tag on `main` after final sign-off

**Current status:** Phase 9 **CLOSED** · tag `v0.10-phase-9`. Phase 10 spec prep — see [docs/phase-10/CTO_HANDOFF.md](docs/phase-10/CTO_HANDOFF.md). **Implementation not authorized.**

---

## License

Private — All rights reserved.
