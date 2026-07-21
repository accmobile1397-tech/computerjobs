# Phase 10 — Implementation Plan

**Spec:** [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) ✅ **APPROVE WITH CONDITIONS** (D-054)  
**Prerequisites:** RFC-005 ✅ CLOSED · Phase 9 ✅ CLOSED (`v0.10-phase-9`, D-053)

**Implementation is AUTHORIZED** under D-054 conditions (C-005-1/2 · DomainEventLog append-only · admin inbox read-only · no Feature Flag Engine).

Implement on `main` in **small commits**. Track progress in **[TASKS.md](./TASKS.md)**. Reuse: `auth/audit`, `shared/health`, Phase 9 notification admin APIs, existing scattered admin routes.

---

## Task ↔ commit map

| Task | Plan step |
|------|-----------|
| P10-001 · P10-002 | 1 — admin module skeleton + permissions |
| P10-003 | 2 — DomainEventLog migration + bus hook |
| P10-004 · P10-005 · P10-006 | 3 — platform admin APIs |
| P10-007 | 4 — billing admin refactor (Prisma out of route) |
| P10-008 | 5 — admin UI shell + auth gate |
| P10-009 · P10-010 · P10-011 · P10-012 | 6 — platform UI pages |
| P10-013 | 7 — notification admin UI |
| P10-014 | 8 — legacy permission alias + seed |
| P10-015 | 9 — tests + C-005-1 guard |

---

## Commit sequence (recommended)

| # | Scope | Module / path |
|---|--------|----------------|
| 1 | Admin permissions registry + `requireAdminPermission` alias helper | `src/modules/admin/permissions/` |
| 2 | Admin services skeleton (dashboard · audit · settings · monitoring) | `src/modules/admin/services/` |
| 3 | DomainEventLog Prisma model + migration + append on EventBus publish | `prisma/` · `events/bus/` |
| 4 | GET `/admin/dashboard/summary` | `app/api/v1/admin/dashboard/` |
| 5 | GET `/admin/audit` | `app/api/v1/admin/audit/` |
| 6 | GET `/admin/events` + GET/PUT `/admin/settings` + GET `/admin/monitoring/summary` | `app/api/v1/admin/` |
| 7 | Refactor `/admin/billing` → `billing-admin.service` (no Prisma in route) | `admin/services/` · route |
| 8 | Admin UI layout — `(admin)` route group · RTL · nav · permission gate | `src/app/(admin)/` |
| 9 | Dashboard + Audit + Settings + Monitoring pages | `(admin)/` |
| 10 | Notifications admin UI (templates · mappings · deliveries · inbox read-only) | `(admin)/notifications/` |
| 11 | IAM seed — full `admin:*` slugs + legacy alias grants on roles | `prisma/seed.ts` |
| 12 | Unit tests — services · routes · C-005-1 static guard (no Prisma in UI) | `admin/*.test.ts` |

---

## HARD RULES (do not violate)

1. **C-005-1:** Admin UI **never** imports Prisma or database clients — HTTP to `/api/v1/admin/*` only.
2. **C-005-2:** No Feature Flag Engine — `SystemSetting` keys `feature.*` only (TD-ADMIN-1 deferred).
3. Admin routes **thin** — authz + validation → `admin/services` → domain module services.
4. All admin **writes** → `writeAuditLog` with actor admin userId.
5. **C-009-6:** Admin notification inbox **read-only** — no mark-read/delete endpoints.
6. **C-010-5:** DomainEventLog **append-only** — no admin edit/delete.
7. **Legacy permissions** remain valid via alias map until deprecation RFC (C-010-3).
8. **No secrets** in GET responses — mask `*secret*`, `*key*`, `*token*` settings.
9. Incremental migration — **do not** delete existing admin routes in one release.
10. Business logic stays in **feature modules** — admin only orchestrates.

---

## Phase 10 MVP admin API set (NEW)

| Endpoint | Permission |
|----------|------------|
| GET `/admin/dashboard/summary` | `admin:dashboard:read` |
| GET `/admin/audit` | `admin:audit:read` |
| GET `/admin/events` | `admin:events:read` |
| GET/PUT `/admin/settings` | `admin:settings:read/write` |
| GET `/admin/monitoring/summary` | `admin:monitoring:read` |

**Existing routes (18 files):** unchanged paths; internal refactor + alias permission checks where touched.

---

## Reserved (no Phase 10 impl)

- Feature Flag Engine (TD-ADMIN-1)
- User impersonation
- Payment reconciliation job/UI (TD-P7B-1)
- Full admin route consolidation (TD-P10-1)
- HTTP integration/E2E tests (TD-P2-1) — unit tests only for MVP
- Grafana / external observability
- Bulk audit export without rate cap
- Resume abuse moderation workflow

---

## Done criteria (for CTO_REPORT)

- [ ] Admin UI shell at `/admin` · RTL · Persian
- [ ] C-005-1 enforced (test + review)
- [ ] Platform viewers: dashboard · audit · events · settings · monitoring
- [ ] Notification admin UI on Phase 9 APIs
- [ ] DomainEventLog populated · event viewer lists entries
- [ ] `admin:*` seeded · legacy aliases work
- [ ] Billing admin route uses admin service (no route Prisma)
- [ ] Unit tests green · typecheck green · prisma validate green
- [ ] CTO_REPORT ≤ 300 lines

---

## Post-approve workflow

1. CTO **APPROVE WITH CONDITIONS** on TECHNICAL_SPEC.fa.md — ✅ D-054
2. Docs status updated (AI_CTO_STATUS · DECISIONS · CHANGELOG · ROADMAP)
3. Implement P10-001 → P10-015 one task at a time per TASKS.md
4. Tag `v0.11-phase-10` on formal close (separate decision)
