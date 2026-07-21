# مشخصات فنی — Phase 10: Admin Platform

**پروژه:** ComputerJobs.ir  
**فاز:** 10  
**وضعیت:** ✅ **APPROVE WITH CONDITIONS** (D-054) — implementation authorized

**Prerequisites (frozen):**
- RFC-005 Admin Platform — ✅ CLOSED (C-005-1/2)
- RFC-003 Events · RFC-004 Notifications — ✅ CLOSED
- Phase 9 — ✅ CLOSED · `v0.10-phase-9` (D-053)
- D-046 Roadmap · D-051 stack complete · D-052 notification IAM · **D-054 Phase 10 spec**

**مرجع:** [RFC-005](../rfc/RFC-005-ADMIN-PLATFORM-ARCHITECTURE.md) · [CTO_HANDOFF.md](./CTO_HANDOFF.md) · [DECISIONS.md](../DECISIONS.md) D-054

---

## ۰. Repository audit (baseline — 2026-07-21)

### ۰.۱. Admin API routes موجود (۱۸ route file)

| مسیر | متد | Permission فعلی | Domain service |
|------|-----|-----------------|----------------|
| `/admin/billing` | GET · POST | `billing:admin` | ⚠️ Prisma مستقیم در route |
| `/admin/companies/[id]/verification` | PATCH | `company:verify` | companies service |
| `/admin/companies/[id]/status` | PATCH | `company:suspend` | companies service |
| `/admin/employers/[userId]/verification` | PATCH | `company:verify` | users/companies |
| `/admin/jobs/[id]/approve` | POST | `job:approve` | jobs service |
| `/admin/locations/provinces/[id]` | PATCH | `location:write` | location service |
| `/admin/locations/cities/[id]` | PATCH | `location:write` | location service |
| `/admin/taxonomy/categories` | POST | `taxonomy:write` | taxonomy service |
| `/admin/taxonomy/suggestions` | GET · POST | `taxonomy:read/write` | taxonomy service |
| `/admin/taxonomy/suggestions/[id]/approve` | POST | `taxonomy:approve` | taxonomy service |
| `/admin/taxonomy/suggestions/[id]/reject` | POST | `taxonomy:approve` | taxonomy service |
| `/admin/taxonomy/suggestions/[id]/merge` | POST | `taxonomy:approve` | taxonomy service |
| `/admin/notifications/templates` | GET · POST | `notifications:admin` | `notifications/admin.service` ✅ |
| `/admin/notifications/templates/[id]` | PATCH · DELETE | `notifications:admin` | admin.service ✅ |
| `/admin/notifications/mappings` | GET · POST | `notifications:admin` | admin.service ✅ |
| `/admin/notifications/mappings/[id]` | PATCH | `notifications:admin` | admin.service ✅ |
| `/admin/notifications/deliveries` | GET | `notifications:admin` | admin.service ✅ (read-only) |
| `/admin/notifications/inbox` | GET | `notifications:admin` | admin.service ✅ (read-only, C-009-6) |

### ۰.۲. Permission slugs seeded (فعلی)

| Namespace | Slugs |
|-----------|--------|
| Legacy admin | `billing:admin` · `notifications:admin` · `company:verify` · `company:suspend` · `job:approve` · `taxonomy:*` · `location:*` · `ai:admin` |
| Partial `admin:*` | `admin:users:read` · `admin:users:suspend` · `admin:roles:manage` |

**Gap:** RFC-005 `admin:*` کامل seed نشده؛ alias mapping تعریف نشده.

### ۰.۳. Admin UI

**هیچ صفحه Admin UI وجود ندارد** — فقط `src/app/page.tsx` (عمومی).  
Phase 10 اولین UI ادمین را می‌سازد.

### ۰.۴. Admin module

`src/modules/admin/` — فقط README skeleton.  
Domain logic پراکنده در feature modules + route handlers.

### ۰.۵. Notification admin (Phase 9)

API کامل تحویل شده — UI Phase 10 consumer خواهد بود.  
Inbox admin **read-only** (C-009-6) — بدون mark-read/delete.

### ۰.۶. Event persistence gap

**`DomainEventOutbox` / event log table وجود ندارد** (RFC-003 deferred in P9).  
Event viewer Phase 10 نیاز به migration append-only دارد (§۴).

---

## ۱. Scope

### ۱.۱. هدف Phase 10

ساخت **Admin Platform MVP**: shell UI فارسی/RTL + APIهای consolidated + viewers read-only — مطابق RFC-005 و **C-005-1** (UI فقط HTTP به Admin API).

### ۱.۲. In scope (MVP)

| # | Deliverable |
|---|-------------|
| 1 | `src/modules/admin/` — permissions registry · orchestration services |
| 2 | Admin UI shell — layout · nav · auth gate · RTL |
| 3 | Dashboard summary API + صفحه (metrics سبک) |
| 4 | Audit viewer API + صفحه (read-only) |
| 5 | SystemSetting admin CRUD API + صفحه |
| 6 | Monitoring panel — proxy `health/deep` + counters DB |
| 7 | Notification admin UI — templates · mappings · deliveries · inbox (read-only) |
| 8 | DomainEventLog migration + event viewer API (minimal append on publish) |
| 9 | IAM seed — `admin:*` slugs + alias legacy permissions |
| 10 | Refactor تدریجی: billing admin route → admin service (بدون حذف route) |
| 11 | Unit tests · permission enforcement · C-005-1 static guard |

### ۱.۳. Out of scope

| Item | Reason |
|------|--------|
| Feature Flag Engine | TD-ADMIN-1 · C-005-2 — فقط `SystemSetting feature.*` |
| جایگزینی one-shot همه admin routes | RFC-005 §12 incremental |
| User impersonation | security RFC جدا |
| Payment reconciliation job/UI کامل | TD-P7B-1 |
| Resume abuse workflow کامل | future |
| Grafana/observability stack | Phase 13+ |
| Bulk export audit بدون rate cap | deferred |
| Secret rotation UI | ops manual |
| Phase 8.1 Resume AI | deferred |
| Analytics warehouse | Phase 13 |

---

## ۲. Architecture proposal

### ۲.۱. Frozen stack (C-005-1)

```text
Admin UI (Next.js · RTL · Persian)
    ↓ fetch /api/v1/admin/*
Admin API routes (thin)
    ↓
admin/services/*  (orchestration only)
    ↓
Domain module services (jobs · billing · notifications · auth · …)
    ↓
Prisma / Redis / Queue
```

**Forbidden:** Prisma در UI · Prisma مستقیم در route handlers (هدف refactor) · فراخوانی non-admin API برای bulk admin data.

### ۲.۲. Module layout

```text
src/modules/admin/
  permissions/          # ADMIN_PERMISSIONS + alias map
  services/
    dashboard.service.ts
    audit-viewer.service.ts
    event-viewer.service.ts
    settings.service.ts
    monitoring.service.ts
    billing-admin.service.ts   # wraps billing domain
  types/
  README.md

src/app/(admin)/          # UI segment — RTL layout
  layout.tsx
  dashboard/page.tsx
  audit/page.tsx
  events/page.tsx
  settings/page.tsx
  monitoring/page.tsx
  notifications/
    templates/page.tsx
    mappings/page.tsx
    deliveries/page.tsx
    inbox/page.tsx
  companies/…             # thin pages → existing APIs (Phase 10.1 optional)
  jobs/…
  taxonomy/…

src/app/api/v1/admin/
  dashboard/summary/route.ts    # NEW
  audit/route.ts                # NEW
  events/route.ts               # NEW
  settings/route.ts             # NEW
  monitoring/summary/route.ts   # NEW
  … (existing routes remain)
```

### ۲.۳. Integration با Phase 9

- Notification admin UI **فقط** consumer of `/api/v1/admin/notifications/*`
- Permission: `notifications:admin` → alias `admin:notifications:read/write` در seed
- Inbox admin: GET-only — UI بدون دکمه mark-read

### ۲.۴. Event log (bridge for event viewer)

Phase 9 outbox implement نکرد. Phase 10 MVP:

```text
EventBus.publish()
  → optional append DomainEventLog (same TX deferred — post-commit append)
  → handlers unchanged
```

Event viewer reads `domain_event_logs` — not a replacement for TD-EVT-1 registry.

---

## ۳. Database impact analysis

**این spec migration design می‌دهد — implement در Phase 10 مجاز پس از APPROVE.**

### ۳.۱. جدول پیشنهادی: `DomainEventLog`

| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| eventId | UUID unique | idempotency |
| name | VARCHAR | dot.case |
| version | INT | C-003-1 |
| occurredAt | DATETIME | |
| aggregateType | VARCHAR | |
| aggregateId | VARCHAR | |
| correlationId | VARCHAR nullable | C-009-1 alignment |
| payload | JSON | PII-redacted |
| createdAt | DATETIME | append-only |

Indexes: `(name, occurredAt)` · `(aggregateId)` · `(correlationId)`

**No update/delete** from admin — read-only viewer.

### ۳.۲. بدون تغییر schema

- `AuditLog` — viewer read-only
- `SystemSetting` — CRUD via admin settings service
- `NotificationTemplate` · `NotificationDelivery` · `Notification` — Phase 9 models
- IAM tables — seed only

### ۳.۳. Reserved (no Phase 10)

- `feature_flags` table (TD-ADMIN-1)
- `AdminNote` — optional future

---

## ۴. API surface proposal

Base: `/api/v1/admin/` · Auth: Bearer · `requirePermission(admin:…)` · envelope استاندارد.

### ۴.۱. NEW — Platform core

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/dashboard/summary` | `admin:dashboard:read` | counts: users · jobs pending · payments stuck · notif failures |
| GET | `/audit` | `admin:audit:read` | paginated AuditLog · filters action/userId/from/to |
| GET | `/events` | `admin:events:read` | paginated DomainEventLog · filter name/aggregateId |
| GET | `/settings` | `admin:settings:read` | list SystemSetting keys (masked secrets) |
| GET | `/settings/[key]` | `admin:settings:read` | single setting |
| PUT | `/settings/[key]` | `admin:settings:write` | upsert + audit |
| GET | `/monitoring/summary` | `admin:monitoring:read` | health/deep + queue depth placeholders |

### ۴.۲. EXISTING — keep (incremental wrap)

همه routeهای §۰.۱ بدون breaking change. Phase 10:

- اضافه کردن alias permission check (legacy OR `admin:*`)
- refactor داخلی به admin/domain services where missing

### ۴.۳. Phase 10.1 optional (spec note — not MVP commit)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/users` | `admin:users:read` |
| PATCH | `/users/[id]/suspend` | `admin:users:write` |
| GET | `/payments` | `admin:payments:read` |

---

## ۵. Permission model proposal

### ۵.۱. RFC-005 slugs (seed Phase 10)

Full set from RFC-005 §5 — `admin:dashboard:read` through `admin:monitoring:read`.

Roles:

| Role | Grants |
|------|--------|
| `admin` | subset: dashboard · audit · companies · jobs · taxonomy · location · notifications read · settings read |
| `super_admin` | all permissions (existing pattern) |

### ۵.۲. Legacy alias map (non-breaking)

| Legacy | Admin alias |
|--------|-------------|
| `billing:admin` | `admin:billing:read` + `admin:billing:write` |
| `notifications:admin` | `admin:notifications:read` + `admin:notifications:write` |
| `company:verify` | `admin:companies:write` |
| `company:suspend` | `admin:companies:write` |
| `job:approve` | `admin:jobs:write` |
| `taxonomy:read` | `admin:taxonomy:read` *(new)* |
| `taxonomy:write` | `admin:taxonomy:write` *(new)* |
| `taxonomy:approve` | `admin:taxonomy:write` |
| `location:write` | `admin:settings:write` or dedicated `admin:location:write` |
| `ai:admin` | `admin:ai:read` + `admin:ai:write` |

`requireAdminPermission()` helper: accepts either legacy or new slug during migration window.

### ۵.۳. UI route guards

Client-side: hide nav items by permission slug from `/api/v1/users/me/permissions` (or dedicated admin bootstrap endpoint).

---

## ۶. Admin UI structure proposal

**Locale:** fa-IR · **Direction:** RTL · **Mobile:** responsive admin (RFC product principles)

### ۶.۱. Shell

```text
/admin
├── /dashboard          # KPI cards
├── /audit              # table + filters
├── /events             # domain event log
├── /settings           # SystemSetting editor
├── /monitoring         # health + alerts
├── /notifications
│   ├── /templates
│   ├── /mappings
│   ├── /deliveries
│   └── /inbox          # read-only badge
├── /billing            # wraps existing API (Phase 10.1)
├── /companies          # moderation links (Phase 10.1)
├── /jobs               # approval queue (Phase 10.1)
└── /taxonomy           # suggestions (Phase 10.1)
```

### ۶.۲. UI rules (C-005-1)

- تمام data از `/api/v1/admin/*` — **never** Server Component با Prisma direct برای admin pages
- Server Components مجاز فقط برای layout/static — data via client fetch or server fetch to Admin API
- Forms: optimistic UI + audit feedback on write

### ۶.۳. Design system

Reuse Tailwind + shadcn/ui · tokens موجود · dark mode optional (not MVP blocker).

---

## ۷. Risks

| Risk | Mitigation |
|------|------------|
| Admin routes با Prisma مستقیم (billing) | P10 refactor task · lint/rule |
| Event log absent | DomainEventLog migration + bus hook |
| Permission sprawl legacy + admin:* | alias helper · seed migration doc |
| UI bypass DB rule | static test + code review checklist |
| No HTTP E2E (TD-P2-1) | admin API unit tests MVP |
| Phase 6 untagged | non-blocking |
| Secret leakage in SystemSetting GET | mask keys matching `*secret*` `*key*` |

---

## ۸. Acceptance criteria

- [ ] Admin UI shell reachable at `/admin` · RTL · Persian labels
- [ ] C-005-1: zero Prisma imports in `src/app/(admin)/`
- [ ] Dashboard · Audit · Settings · Monitoring pages functional via Admin API
- [ ] Notification admin UI consumes Phase 9 APIs only
- [ ] Admin inbox: no write actions (C-009-6 preserved)
- [ ] `admin:*` permissions seeded · legacy aliases work
- [ ] DomainEventLog populated on publish · event viewer lists entries
- [ ] All admin writes → `writeAuditLog` with actor admin userId
- [ ] Unit tests green · typecheck green · prisma validate green
- [ ] No Feature Flag Engine (TD-ADMIN-1 deferred)
- [ ] CTO_REPORT ≤ 300 lines

---

## ۹. Conditions (proposed for CTO APPROVE)

| ID | Condition |
|----|-----------|
| C-010-1 | Admin UI **never** imports Prisma/database (C-005-1 enforced in CI/test) |
| C-010-2 | Feature Flag Engine **not** implemented — `SystemSetting feature.*` only (C-005-2) |
| C-010-3 | Legacy permission slugs remain valid through alias map until deprecation RFC |
| C-010-4 | Admin notification inbox stays read-only (inherits C-009-6) |
| C-010-5 | DomainEventLog append-only — no admin edit/delete |

---

## ۱۰. Debt (carry / new)

**Carry:** TD-ADMIN-1 · TD-P2-1 · TD-P7B-1 · TD-EVT-1 · TD-NOTIF-* · prior phase debt

**New (optional register):** TD-P10-1 Admin route consolidation (full migration off legacy paths)

---

## ۱۱. Relation to roadmap

| Phase | After P10 |
|-------|-----------|
| 11 SEO | sitemap regen trigger in admin (minimal) |
| 12 SSR | public pages — minimal admin |
| 13 Analytics | extends `admin:dashboard:read` |

**Implementation authorized:** only after CTO **APPROVE** on this spec.
