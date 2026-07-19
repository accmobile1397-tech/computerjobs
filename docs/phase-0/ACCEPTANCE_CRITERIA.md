# معیارهای پذیرش — Phase 0

**پروژه:** ComputerJobs.ir  
**فاز:** 0 — Foundation & Architecture  
**نسخه:** 0.1.0

---

## چک‌لیست پذیرش

### ۱. مستندات

- [ ] `docs/phase-0/TECHNICAL_SPEC.md` — مشخصات فنی فارسی کامل
- [ ] `docs/phase-0/ARCHITECTURE.md` — یادداشت‌های معماری با diagram
- [ ] `docs/phase-0/DATABASE_DESIGN.md` — طراحی DB + ERD آینده
- [ ] `docs/phase-0/API_DESIGN.md` — قرارداد API + endpoints Phase 0
- [ ] `docs/phase-0/ACCEPTANCE_CRITERIA.md` — این سند
- [ ] `docs/CHANGELOG.md` — نسخه 0.1.0
- [ ] `docs/DEPLOYMENT.md` — راهنمای استقرار VPS با OpenShip
- [ ] `docs/MIGRATION.md` — workflow Prisma migrations
- [ ] `README.md` — معرفی، prerequisites، local dev

### ۲. Scaffolding پروژه

- [ ] Next.js App Router با TypeScript اجرا می‌شود
- [ ] TailwindCSS پیکربندی شده
- [ ] shadcn/ui نصب و یک component نمونه render می‌شود
- [ ] `src/app/layout.tsx`: `dir="rtl"`, `lang="fa"`
- [ ] فونت فارسی Vazirmatn load می‌شود
- [ ] صفحه اصلی SSR با metadata SEO پایه

### ۳. Backend Infrastructure

- [ ] Prisma schema + client singleton
- [ ] `npx prisma migrate dev` بدون خطا
- [ ] Redis client + connection test
- [ ] BullMQ queue connection skeleton
- [ ] S3/MinIO client stub در `lib/storage/`
- [ ] Env validation با zod — fail fast
- [ ] Pino structured logger

### ۴. API Endpoints

- [ ] `GET /api/v1/health` → 200 با envelope استاندارد
- [ ] `GET /api/v1/health/deep` → 200 (MySQL + Redis healthy)
- [ ] `GET /api/v1/health/deep` → 503 (اگر سرویس down باشد)
- [ ] Response envelope: `{ success, data, error, meta }`

### ۵. Security

- [ ] `src/middleware.ts` — security headers
- [ ] `.env.example` — تمام متغیرها بدون secret واقعی
- [ ] `.env` در `.gitignore`
- [ ] هیچ credential در git history

### ۶. Docker

- [ ] `docker/docker-compose.yml` — MySQL 8, Redis 7, MinIO
- [ ] `docker compose up -d` — همه سرویس‌ها healthy
- [ ] `docker/docker-compose.prod.yml` — production overlay
- [ ] `docker/Dockerfile.worker` — BullMQ worker skeleton

### ۷. CI/CD

- [ ] `.github/workflows/ci.yml` — lint, typecheck, prisma validate, build
- [ ] CI pipeline سبز روی push/PR

### ۸. SEO Baseline

- [ ] Root layout metadata: title, description
- [ ] OpenGraph tags
- [ ] `robots.txt` در public/
- [ ] صفحه اصلی server-rendered (view source نشان می‌دهد HTML)

### ۹. Git & Review

- [ ] تمام فایل‌ها commit شده
- [ ] push به GitHub
- [ ] **توقف — منتظر review قبل از Phase 1**

---

## تست دستی

### Local Development

```bash
# 1. Clone & install
git clone <repo>
cd ComputerJob
npm install

# 2. Environment
cp .env.example .env
# edit .env with local values

# 3. Docker services
cd docker
docker compose up -d
cd ..

# 4. Database
npx prisma migrate dev

# 5. Dev server
npm run dev

# 6. Verify
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/health/deep
```

### Expected Results

| Test | Expected |
|------|----------|
| `npm run dev` | Server starts on :3000 |
| `npm run build` | Build succeeds |
| `npm run lint` | No errors |
| Health endpoint | `{ "success": true, "data": { "status": "ok" } }` |
| Deep health | database + redis status "ok" |
| Homepage | RTL Persian text, SSR HTML |
| Docker ps | 3 containers healthy |

---

## Definition of Done

Phase 0 **Done** است وقتی:

1. همه checkboxهای بالا tick شده باشند
2. CI pipeline سبز باشد
3. مستندات فارسی کامل باشند
4. code review انجام شده باشد
5. **Phase 1 شروع نشود** تا تأیید صریح

---

## مراجع

- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_DESIGN.md](./API_DESIGN.md)
