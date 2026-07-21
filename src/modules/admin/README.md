# Admin Module

Control-center orchestration for ComputerJobs.ir per [RFC-005](../../../docs/rfc/RFC-005-ADMIN-PLATFORM-ARCHITECTURE.md).

**Phase:** 10 · **Authorized:** D-054

## Stack (C-005-1 — HARD)

```text
Admin UI → /api/v1/admin/* → admin/services → domain modules → DB
```

Admin UI **never** imports Prisma. This module **orchestrates only** — business rules stay in feature modules (`billing/`, `jobs/`, `notifications/`, …).

## Layout (P10-001)

| Path | Role | Task |
|------|------|------|
| `permissions/` | `ADMIN_PERMISSIONS` · alias map · `requireAdminPermission` | ✅ P10-002 |
| `services/` | Dashboard · audit · events · settings · monitoring · billing-admin | P10-004 ✅ dashboard |
| `types/` | Shared admin DTOs | P10-001+ |
| `README.md` | This file | — |

## Hard rules

- **C-005-1** — UI → API → services → domain → DB
- **C-005-2** — no Feature Flag Engine; `SystemSetting feature.*` only (TD-ADMIN-1)
- DomainEventLog append-only
- Admin notification inbox read-only (C-009-6)
- All material writes → `writeAuditLog`

## Non-goals (this module)

- Feature Flag Engine
- Domain business logic (belongs in feature modules)
- Direct Prisma usage from Admin UI
