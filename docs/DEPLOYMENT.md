# راهنمای استقرار — ComputerJobs.ir

**استراتژی:** VPS واحد با OpenShip (self-hosted)  
**نسخه:** 0.1.0 — Phase 0

---

## ۱. نمای کلی

تمام اجزای پلتفرم روی **یک VPS** مستقر می‌شوند:

| جزء | نقش |
|-----|-----|
| **OpenShip** | push-to-deploy، SSL، reverse proxy، env management |
| **Next.js** | SSR + API Routes |
| **MySQL 8** | پایگاه داده اصلی |
| **Redis 7** | cache + BullMQ queue |
| **MinIO** | ذخیره‌سازی S3-compatible |
| **BullMQ Worker** | پردازش background jobs |

---

## ۲. پیش‌نیازها

- VPS Linux (Ubuntu 22.04+ توصیه می‌شود)
- OpenShip self-hosted نصب‌شده روی VPS
- دامنه `computerjobs.ir` (DNS → IP VPS)
- مخزن GitHub متصل به OpenShip

---

## ۳. استقرار سرویس‌های داده (Docker Compose)

قبل از deploy اپلیکیشن، سرویس‌های MySQL، Redis و MinIO را بالا بیاورید:

```bash
cd docker
cp .env.example .env
# مقادیر .env را ویرایش کنید
docker compose up -d
```

بررسی سلامت:

```bash
docker compose ps
# همه سرویس‌ها باید healthy باشند
```

---

## ۴. استقرار اپلیکیشن با OpenShip

### ۴.۱ اتصال مخزن

1. در dashboard OpenShip، پروژه جدید بسازید
2. مخزن GitHub `computerjobs` را connect کنید
3. branch `main` را به‌عنوان production انتخاب کنید

### ۴.۲ پیکربندی Build

OpenShip به‌صورت خودکار Next.js را detect می‌کند:

- **Build command:** `npm run build`
- **Start command:** `npm run start`
- **Port:** `3000`

### ۴.۳ Environment Variables

در OpenShip dashboard این متغیرها را تنظیم کنید:

```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@mysql:3306/computerjobs
REDIS_URL=redis://redis:6379
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=computerjobs
S3_REGION=us-east-1
JWT_ACCESS_SECRET=generate-secure-random-string
JWT_REFRESH_SECRET=generate-secure-random-string
APP_URL=https://computerjobs.ir
```

> **هشدار:** secretهای واقعی را هرگز در git commit نکنید.

### ۴.۴ دامنه و SSL

1. در OpenShip، دامنه `computerjobs.ir` را اضافه کنید
2. SSL خودکار (Let's Encrypt) فعال می‌شود
3. DNS A record را به IP VPS اشاره دهید

### ۴.۵ BullMQ Worker

Worker را به‌صورت سرویس جدا deploy کنید:

- **Dockerfile:** `docker/Dockerfile.worker`
- **Env vars:** همان DATABASE_URL و REDIS_URL

---

## ۵. استقرار Local (Development)

```bash
git clone <repo-url>
cd ComputerJob
npm install
cp .env.example .env

cd docker && docker compose up -d && cd ..
npx prisma migrate dev
npm run dev
```

---

## ۶. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) روی هر push/PR:

1. lint
2. typecheck
3. prisma validate
4. build

Deploy production از طریق OpenShip push-to-deploy انجام می‌شود — نه از CI.

---

## ۷. Rollback

در OpenShip dashboard:

1. Deployments → تاریخچه
2. نسخه قبلی → Rollback

---

## ۸. Monitoring (Phase 14)

Phase 0 فقط health endpoints دارد:

- `GET /api/v1/health` — liveness
- `GET /api/v1/health/deep` — MySQL + Redis

---

## ۹. مراجع

- [OpenShip Documentation](https://github.com/oblien/openship)
- [ARCHITECTURE.md](./phase-0/ARCHITECTURE.md)
- [MIGRATION.md](./MIGRATION.md)
