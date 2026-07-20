# RFC-005 — Admin Platform Architecture

**Status:** ✅ **APPROVED / FROZEN / CLOSED** (CTO APPROVE WITH CONDITIONS — C-005-1/2 applied 2026-07-20)  
**ID:** RFC-005 · **Decision:** D-049  
**Audience:** ComputerJobs.ir control center — API-first, UI in Phase 10  
**Depends on:** RFC-003 (events/activity) · RFC-004 (notification admin) · existing `/api/v1/admin/*`  
**Blocks:** Phase 10 (Admin Platform UI + consolidated APIs)

---

## 1. Purpose

Freeze the **Admin Platform** architecture before dashboard, moderation consoles, and cross-module admin APIs sprawl.

**Deliverables (architecture only):**

- Admin module boundaries + API surface map  
- Permission model (`admin:*`)  
- Settings vs feature flags  
- Audit + event viewer contracts  
- Migration path from current scattered admin routes  
- Monitoring hooks  

**Non-goal:** Building Admin UI, replacing every existing admin route in one release, or full observability stack (Grafana/etc.) in Phase 10.

---

## 2. Principles

1. **Admin routes are thin** — delegate to domain modules (`jobs/`, `billing/`, …); no business rules in `app/api/v1/admin/*` handlers beyond authz + validation.
2. **Read mostly, write carefully** — destructive actions require `admin:*:write` + audit log.
3. **Same invariants as product** — admin cannot bypass RFC-001 invariants (single resume, contact unlock, etc.).
4. **Data-driven configuration** — plans, quotas, AI routing, notification templates via admin APIs touching DB/`SystemSetting` — never env redeploy for business toggles.
5. **Separate Admin API from Admin UI** — Phase 10 UI is a client of Phase 10/admin APIs; mobile/web admin shares same backend.
6. **Audit everything material** — admin mutations emit `AuditAction` + optional domain event.
7. **No secrets in responses** — provider keys, webhook secrets never returned; only masked metadata.

---

## 2.1 C-005-1 — Admin UI never touches DB (HARD RULE)

**Admin Dashboard / Admin UI must never connect directly to the database.**

Frozen stack:

```text
Admin UI (Phase 10)
    ↓ HTTP only
Admin API  (/api/v1/admin/*)
    ↓
admin/services  (orchestration)
    ↓
Domain Module services  (jobs · billing · auth · …)
    ↓
Database
```

Forbidden: Prisma/client imports in frontend; admin UI calling non-admin API routes for bulk data; admin UI SQL/ORM.

Read-only viewers (`audit-viewer`, `event-viewer`) still go through **Admin API** → module query services — not raw DB from UI.

---

## 2.2 C-005-2 — Feature Flag Engine (reserved)

**TD-ADMIN-1:** Dedicated Feature Flag Engine (replaces ad-hoc `SystemSetting feature.*` long-term).  
**Not implemented in Phase 10 MVP.** Until then: `SystemSetting` keys prefixed `feature.` allowed (documented in seed).

---

## 3. Module layout (frozen)

```text
src/modules/admin/
  services/           # orchestration only — calls domain modules
  permissions/        # admin slug registry + guards
  audit-viewer/       # query AuditLog (read-only)
  event-viewer/       # query domain event log (read-only, Phase 10)
  settings/           # SystemSetting CRUD wrappers
  dashboard/          # aggregated metrics readers (Phase 10)
  types/

src/app/api/v1/admin/
  ...                 # thin routes — migrate gradually to admin/services
```

**Domain logic stays in feature modules.** Example: plan change → `billing/services` called by `admin/services/billing-admin.service.ts`.

---

## 4. Admin domain map

| Admin domain | Primary module | Existing routes (Phase 0–8) | Phase 10 additions |
|--------------|----------------|----------------------------|---------------------|
| **Users** | auth · users | `admin/users/*`, suspend | search · impersonation (optional, gated) |
| **Companies** | companies | verify · status | bulk · notes |
| **Jobs** | jobs | `admin/jobs/[id]/approve` | queue · reject reasons · featured override |
| **Resumes** | resumes | — | visibility review · abuse flags |
| **Billing** | billing | `admin/billing` | plans · features · prices · grants |
| **Wallets** | billing | via billing admin | ledger viewer |
| **Payments** | billing | — | reconciliation UI (TD-P7B-1) |
| **AI** | ai | — | provider · modelRouting · rate limits |
| **Notifications** | notifications | — | templates · delivery log · replay |
| **Settings** | shared + billing | partial SystemSetting | unified settings CRUD |
| **Audit** | auth | — | AuditLog viewer + export |
| **Monitoring** | shared | `health/deep` | job queue depth · provider health |

---

## 5. Permission model (frozen slugs)

Extend IAM with **`admin:`** namespace. Super_admin inherits all.

| Slug | Capability |
|------|------------|
| `admin:dashboard:read` | Summary metrics |
| `admin:users:read` | List/view users |
| `admin:users:write` | Suspend · unlock · role assign |
| `admin:companies:read` | List companies |
| `admin:companies:write` | Verify · suspend |
| `admin:jobs:read` | Moderation queue |
| `admin:jobs:write` | Approve · reject · force close |
| `admin:resumes:read` | Review visibility |
| `admin:resumes:write` | Force status/visibility (audit required) |
| `admin:billing:read` | Plans · subscriptions · wallets |
| `admin:billing:write` | Grants · plan overrides |
| `admin:payments:read` | Payment list |
| `admin:payments:write` | Refund trigger (future) |
| `admin:ai:read` | AI settings read |
| `admin:ai:write` | Provider · routing · limits |
| `admin:notifications:read` | Templates · deliveries |
| `admin:notifications:write` | Template CRUD · replay |
| `admin:settings:read` | SystemSetting read |
| `admin:settings:write` | SystemSetting write |
| `admin:audit:read` | Audit log viewer |
| `admin:events:read` | Domain event log viewer |
| `admin:monitoring:read` | Health · queues · metrics |

**Migration:** Existing slugs (`billing:admin`, `company:verify`, `job:approve`, …) remain valid; Phase 10 adds aliases mapping to `admin:*` for consistency — no breaking removal until CTO approves deprecation in spec.

---

## 6. API conventions

Base path: `/api/v1/admin/{domain}/...`

| Rule | Detail |
|------|--------|
| Auth | Bearer + `requirePermission(admin:…)` |
| Pagination | `cursor` or `page` + `limit` (max from SystemSetting) |
| Filters | query params only; no raw SQL from client |
| Writes | POST/PATCH/DELETE → audit + optional event |
| Idempotency | `Idempotency-Key` header on grants/refunds/replay |
| Response | Standard `ApiResponse` envelope |

**Forbidden:** Admin endpoints that bypass module services and touch Prisma directly (except audit-viewer read queries).

---

## 7. Settings vs feature flags

| Mechanism | Use for | Storage |
|-----------|---------|---------|
| **SystemSetting** | Business config (quotas, providers, routing, rate limits) | `system_settings` |
| **Feature flags** (TD-ADMIN-1) | Gradual rollout of UI/features | future `feature_flags` table · until then `feature.*` SystemSetting |

Rule: **Do not** overload SystemSetting for boolean UI experiments once flag framework lands. Until then, `SystemSetting` keys prefixed `feature.` allowed (seed documented).

Admin **Settings** module is the only writer for `SystemSetting` (except module-internal seeds on deploy).

---

## 8. Audit viewer (read-only contract)

```text
GET /api/v1/admin/audit
  ?action=JOB_PUBLISHED
  &userId=
  &from=ISO
  &to=ISO
  &cursor=

Response: { items: AuditLog[], nextCursor }
```

Rules:

- Read-only — no delete/edit  
- PII fields masked in list view; full metadata only for `admin:audit:read` + super_admin  
- Export (CSV) optional Phase 10 — rate limited  

Reuses existing `AuditLog` model — no duplicate audit store.

---

## 9. Event viewer (read-only — depends RFC-003)

```text
GET /api/v1/admin/events
  ?name=payment.succeeded
  &aggregateId=
  &from=ISO
  &to=ISO
```

Requires domain event persistence from RFC-003 Phase 9 implementation. RFC-005 freezes **read API shape** only.

---

## 10. Monitoring hooks

Phase 10 admin dashboard reads:

| Signal | Source |
|--------|--------|
| API health | `/api/v1/health/deep` |
| Queue depth | BullMQ `events:dispatch`, notification retries |
| Payment stuck | `Payment` status PROCESSING count (TD-P7B-1) |
| AI failures | audit `AI_REQUEST_FAILED` rate |
| Notification failures | `NOTIFICATION_FAILED` |

No new metrics vendor required in Phase 10 — structured logs + DB counters sufficient until observability RFC.

---

## 11. Moderation workflows (frozen behavior)

| Entity | States | Admin action |
|--------|--------|--------------|
| Job | PENDING_REVIEW → PUBLISHED / rejected | `admin:jobs:write` |
| Company | verification PENDING → VERIFIED | `admin:companies:write` |
| Resume | abuse report (future) | `admin:resumes:write` |

Rejections store `reasonCode` + optional note in audit metadata.

---

## 12. Migration from existing admin routes

**Incremental — no big-bang.**

| Current route | Target |
|---------------|--------|
| `admin/billing` | stays; wrap with `admin/services/billing-admin` |
| `admin/companies/*` | stays; add permission alias `admin:companies:write` |
| `admin/jobs/*` | stays |
| `admin/taxonomy/*` | stays under taxonomy module; permission `admin:taxonomy:*` (Phase 10) |
| `admin/locations/*` | stays |

New consolidated routes added alongside; old routes deprecated in CHANGELOG when UI migrates.

---

## 13. Explicit non-goals

- Full React Admin UI in this RFC (Phase 10)  
- Multi-tenant white-label admin  
- Customer-support impersonation without audit (if ever added, separate security RFC)  
- Editing audit logs  
- Production secret rotation UI (ops manual until secrets RFC)  

---

## 14. Relation to phases

| Phase | Scope |
|-------|--------|
| **9** | Notification module may expose `admin:notifications:*` stubs |
| **10** | Admin dashboard UI + audit viewer + consolidated APIs per this RFC |
| **11–12** | SEO/public pages — minimal admin (sitemap regen trigger) |
| **13** | Analytics dashboards — `admin:dashboard:read` extensions |

**No Phase 10 coding until RFC-005 FROZEN** (done). Phase 10 TECHNICAL_SPEC after Phase 9.  
Recommended: RFC-003 + RFC-004 frozen before Phase 10 spec finalization (done).

---

## 15. Security checklist (admin)

- [ ] All write routes require explicit `admin:*:write`  
- [ ] All writes → `writeAuditLog` with actor admin userId  
- [ ] Rate limit admin login + sensitive endpoints  
- [ ] No mass export without `admin:audit:read` + daily cap  
- [ ] CSP + separate admin origin optional (Phase 10 UI decision)  

---

## CTO Decision Log

| Date | Decision |
|------|----------|
| 2026-07-20 | APPROVE WITH CONDITIONS (C-005-1 no UI→DB · C-005-2 TD-ADMIN-1 reserved) |
| 2026-07-20 | Conditions applied → **APPROVED / FROZEN / CLOSED** |

- [x] APPROVE WITH CONDITIONS  
- [x] **CLOSED**  
- [ ] REJECT  

**Debt:** TD-ADMIN-1 Feature Flag Engine (P2)
