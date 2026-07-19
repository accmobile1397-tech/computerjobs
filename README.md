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

## Documentation

| Document | Description |
|----------|-------------|
| [docs/phase-0/TECHNICAL_SPEC.md](docs/phase-0/TECHNICAL_SPEC.md) | مشخصات فنی |
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

**Next:** Phase 1 — Authentication & RBAC (awaiting approval)

---

## License

Private — All rights reserved.
