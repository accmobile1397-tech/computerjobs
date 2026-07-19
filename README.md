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
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decision log |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| [docs/rfc/](docs/rfc/) | Feature RFCs |
| [docs/phase-0/CTO_REPORT.md](docs/phase-0/CTO_REPORT.md) | Phase 0 — **Approved** |
| [docs/phase-1/README.md](docs/phase-1/README.md) | Phase 1 IAM (next) |
| [docs/phase-0/ARCHITECTURE.md](docs/phase-0/ARCHITECTURE.md) | معماری |
| [docs/phase-0/DATABASE_DESIGN.md](docs/phase-0/DATABASE_DESIGN.md) | طراحی DB |
| [docs/phase-0/API_DESIGN.md](docs/phase-0/API_DESIGN.md) | طراحی API |
| [docs/phase-0/ACCEPTANCE_CRITERIA.md](docs/phase-0/ACCEPTANCE_CRITERIA.md) | معیارهای پذیرش |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | استقرار OpenShip VPS |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Prisma migrations |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | تغییرات |

---

## Phase Status

**Phase 0 — Foundation & Architecture** (current)

- [x] Next.js scaffold + RTL Persian
- [x] Docker Compose (MySQL, Redis, MinIO)
- [x] Prisma + health endpoints
- [x] CI pipeline
- [x] OpenShip VPS deployment docs

## CTO Review Process

1. Agent reads [`.cto/RULEBOOK.md`](.cto/RULEBOOK.md) before each phase
2. Agent produces [`docs/phase-0/CTO_REPORT.md`](docs/phase-0/CTO_REPORT.md) at phase end
3. Human CTO reviews → feedback → fixes → approval → next phase

**Current status:** Phase 0 **Approved** — Phase 1 IAM spec next

---

## License

Private — All rights reserved.
