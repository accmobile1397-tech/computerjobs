# یادداشت‌های معماری — Phase 0

**پروژه:** ComputerJobs.ir  
**نسخه:** 0.1.0

---

## ۱. نمای کلی معماری

ComputerJobs.ir یک پلتفرم monolithic با Next.js App Router است که API Routes، SSR/SSG، و background workers را در یک codebase مدیریت می‌کند.

```mermaid
flowchart TB
  subgraph presentation [Presentation Layer]
    Pages["App Router Pages\nSSR/SSG"]
    Components["React Components\nshadcn/ui RTL"]
  end
  subgraph api [API Layer]
    Routes["API Routes\n/api/v1/*"]
    Middleware["Middleware\nSecurity Headers"]
  end
  subgraph service [Service Layer]
    Services["Business Services\n(future phases)"]
  end
  subgraph infra [Infrastructure Layer]
    Prisma["Prisma ORM"]
    Redis["Redis Client"]
    Queue["BullMQ"]
    Storage["S3 Client"]
    Logger["Pino Logger"]
  end
  subgraph external [External Services VPS]
    MySQL[(MySQL 8)]
    RedisSrv[(Redis 7)]
    MinIO[MinIO S3]
  end
  Pages --> Routes
  Components --> Pages
  Routes --> Middleware
  Routes --> Services
  Services --> Prisma
  Services --> Redis
  Services --> Queue
  Services --> Storage
  Routes --> Logger
  Prisma --> MySQL
  Redis --> RedisSrv
  Queue --> RedisSrv
  Storage --> MinIO
```

---

## ۲. لایه‌های معماری

### ۲.۱ Presentation Layer

- **App Router Pages:** SSR برای SEO، SSG برای صفحات استاتیک
- **Components:** shadcn/ui با RTL، mobile-first
- **Metadata:** dynamic SEO per page

### ۲.۲ API Layer

- REST endpoints تحت `/api/v1/`
- Response envelope استاندارد
- Rate limiting (Phase 13)
- CSRF protection (Phase 13)

### ۲.۳ Service Layer

- Business logic جدا از route handlers
- Phase 0: فقط health service
- فازهای بعد: JobService, ResumeService, AIService, ...

### ۲.۴ Infrastructure Layer

- **Prisma:** database access با connection pooling
- **Redis:** caching + rate limiting + session (future)
- **BullMQ:** async job processing
- **S3:** file storage abstraction
- **Pino:** structured JSON logging

---

## ۳. Event-Driven + Queue-First

```mermaid
sequenceDiagram
  participant API as API Route
  participant Queue as BullMQ Queue
  participant Worker as BullMQ Worker
  participant DB as MySQL
  API->>Queue: enqueue job
  API-->>API: return 202 Accepted
  Queue->>Worker: process job
  Worker->>DB: persist result
  Worker->>Queue: acknowledge
```

**Phase 0:** فقط connection skeleton — بدون business jobs.

**فازهای بعد:**
- Job indexing → search queue
- Email/SMS → notification queue
- AI processing → ai-queue
- Skill extraction → taxonomy queue

---

## ۴. OpenShip VPS Deployment Topology

```mermaid
flowchart TB
  subgraph internet [Internet]
    User[User Browser]
  end
  subgraph vps [VPS - OpenShip Self-Hosted]
    OpenShip[OpenShip\nSSL + Reverse Proxy]
    NextJS["Next.js App\nSSR + API Routes"]
    Worker[BullMQ Worker]
    MySQL[(MySQL 8)]
    Redis[(Redis 7)]
    MinIO[MinIO S3]
  end
  User -->|HTTPS| OpenShip
  OpenShip --> NextJS
  NextJS --> MySQL
  NextJS --> Redis
  NextJS --> MinIO
  Worker --> Redis
  Worker --> MySQL
```

### ۴.۱ OpenShip (Platform Layer)

- **Self-hosted** روی VPS — push-to-deploy از GitHub
- SSL خودکار (Let's Encrypt) برای دامنه `computerjobs.ir`
- مدیریت Environment Variables در dashboard OpenShip
- Build روی ماشین build؛ production server فقط containerها را اجرا می‌کند
- پشتیبانی از Docker Compose برای MySQL، Redis، MinIO

### ۴.۲ Application Layer (روی همان VPS)

| سرویس | نقش | شبکه |
|--------|-----|------|
| Next.js | SSR + API Routes | public via OpenShip proxy |
| BullMQ Worker | background jobs | internal Docker network |
| MySQL 8 | primary database | internal only |
| Redis 7 | cache + queue | internal only |
| MinIO | S3-compatible storage | internal (+ API via app) |

### ۴.۳ امنیت شبکه

- Redis و MySQL **بدون expose عمومی** — فقط Docker internal network
- Firewall VPS: پورت 80/443 (OpenShip) + SSH
- Secretها فقط در OpenShip env vars — never in git
- Backup strategy: daily MySQL dump (Phase 14)

---

## ۵. Security Baseline (Phase 0)

### ۵.۱ HTTP Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; ...
```

### ۵.۲ Secret Management

- `.env.example` — template بدون مقادیر واقعی
- `.env` — gitignored
- OpenShip Environment Variables — production secrets
- `docker/.env` — docker-compose env file (local/staging)

### ۵.۳ Input Validation

- zod schema validation برای env vars
- API request validation (فازهای بعد)

---

## ۶. Observability Hooks

### ۶.۱ Logging

- **pino** structured JSON logs
- Request correlation ID در headers
- Log levels: fatal, error, warn, info, debug, trace

### ۶.۲ Health Checks

| Endpoint | نوع | بررسی |
|----------|-----|--------|
| `GET /api/v1/health` | Liveness | process alive |
| `GET /api/v1/health/deep` | Readiness | MySQL + Redis ping |

### ۶.۳ Error Handling

- Global error boundary در App Router
- API error handler با envelope استاندارد
- Unhandled rejection logging

---

## ۷. Abstraction Layers (Spec Only — Phase 0)

| Layer | Interface | Implementation |
|-------|-----------|----------------|
| AI Gateway | `AIProvider` | OpenAI, Gemini, Groq, ... (Phase 7) |
| Storage | `StorageProvider` | MinIO/S3 (Phase 0 stub) |
| Queue | `QueueProvider` | BullMQ (Phase 0 skeleton) |
| Notification | `NotificationProvider` | Email, SMS, In-App (Phase 10) |
| Payment | `PaymentProvider` | TBD (Phase 9) |

---

## ۸. مراجع

- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_DESIGN.md](./API_DESIGN.md)
