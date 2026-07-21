# راهنمای Migration — Prisma

**پروژه:** ComputerJobs.ir  
**DBMS:** MySQL 8  
**ORM:** Prisma

---

## ۱. Workflow توسعه

### ایجاد migration جدید

```bash
# پس از تغییر schema.prisma
npx prisma migrate dev --name describe_your_change
```

### اعمال migration در production

```bash
npx prisma migrate deploy
```

---

## ۲. Phase 0

Phase 0 فقط foundation را migrate می‌کند — بدون جدول کسب‌وکار.

```bash
npx prisma migrate dev --name init
```

---

## ۳. Seed Data

```bash
npm run db:seed
```

Seeds IAM permissions/roles, location, taxonomy, billing plans, and notification templates.  
**Idempotent:** safe to re-run on existing databases (uses `upsert`).

### Phase 9 — notification permissions (existing databases)

Added in P9-014 (D-052). Databases created **before** `dec5cd7` will not have notification permission rows until seed is re-run.

**Required slugs:**

| Slug | Roles |
|------|--------|
| `notifications:read:own` | `job_seeker`, `employer`, `super_admin` |
| `notifications:preferences:own` | `job_seeker`, `employer`, `super_admin` |
| `notifications:admin` | `admin`, `super_admin` |

**Upgrade steps (staging / production):**

```bash
# 1. Backup database
# 2. Apply pending migrations
npm run db:deploy

# 3. Re-run seed (idempotent — upserts permissions + role mappings only; does not wipe data)
npm run db:seed
```

**Verify (MySQL):**

```sql
SELECT slug FROM Permission WHERE slug LIKE 'notifications:%' AND deletedAt IS NULL;
-- Expect 3 rows

SELECT r.slug AS role, p.slug AS permission
FROM RolePermission rp
JOIN Role r ON r.id = rp.roleId
JOIN Permission p ON p.id = rp.permissionId
WHERE p.slug LIKE 'notifications:%' AND rp.deletedAt IS NULL
ORDER BY r.slug, p.slug;
-- Expect: job_seeker×2, employer×2, admin×1, super_admin×3
```

**Automated check:** `src/modules/notifications/permissions.test.ts` (C-P9-1 seed contract).

**Reference:** [docs/phase-9/PHASE_9_CLOSURE_REPORT.md](./phase-9/PHASE_9_CLOSURE_REPORT.md) · D-052 · D-053

### Phase 10 — admin:* permissions (existing databases)

Added in P10-014. Databases seeded **before** this change will not have the full RFC-005 `admin:*` namespace until seed is re-run.

**What changes:**

| Item | Behavior |
|------|----------|
| New `admin:*` slugs | Upserted from `ADMIN_PERMISSIONS` (dashboard → monitoring + taxonomy/location) |
| Legacy slugs | **Kept** (`billing:admin`, `notifications:admin`, `company:verify`, …) — C-010-3 |
| Phase 9 notification IAM | **Unchanged** (`notifications:read:own` · `preferences:own` · `admin`) |
| `admin` role | Keeps legacy grants + receives Phase 10 `admin:*` subset |
| `super_admin` | Receives all permission rows (including new `admin:*`) |

**Upgrade steps (staging / production):**

```bash
# 1. Backup database
# 2. Apply pending migrations (if any)
npm run db:deploy

# 3. Re-run seed (idempotent — upserts permissions + role mappings only; does not wipe data)
npm run db:seed
```

**Verify (MySQL):**

```sql
SELECT slug FROM Permission
WHERE slug LIKE 'admin:%' AND deletedAt IS NULL
ORDER BY slug;
-- Expect full Phase 10 admin:* set (incl. admin:dashboard:read, admin:monitoring:read, …)
-- Plus pre-P10: admin:users:suspend, admin:roles:manage

SELECT r.slug AS role, p.slug AS permission
FROM RolePermission rp
JOIN Role r ON r.id = rp.roleId
JOIN Permission p ON p.id = rp.permissionId
WHERE p.slug = 'notifications:admin' AND rp.deletedAt IS NULL;
-- Expect: admin, super_admin (Phase 9 behavior preserved)

SELECT COUNT(*) AS admin_star_on_admin
FROM RolePermission rp
JOIN Role r ON r.id = rp.roleId
JOIN Permission p ON p.id = rp.permissionId
WHERE r.slug = 'admin'
  AND p.slug LIKE 'admin:%'
  AND rp.deletedAt IS NULL;
-- Expect > 0 (Phase 10 admin:* grants present)
```

**Automated check:** `src/modules/admin/permissions/permissions.test.ts` (P10-014 seed contract).

**Reference:** [docs/phase-10/TECHNICAL_SPEC.fa.md](./phase-10/TECHNICAL_SPEC.fa.md) §5 · C-010-3 · D-054

---

## ۴. دستورات مفید

| دستور | کاربرد |
|-------|--------|
| `npx prisma studio` | GUI برای DB |
| `npx prisma validate` | اعتبارسنجی schema |
| `npx prisma generate` | regenerate client |
| `npx prisma migrate reset` | reset DB (dev only!) |

---

## ۵. قراردادها

- UUID primary keys
- Audit fields: `id`, `createdAt`, `updatedAt`, `deletedAt`
- Soft delete با `deletedAt`
- snake_case در DB، camelCase در Prisma

---

## ۶. Production (OpenShip VPS)

1. Backup DB قبل از migration
2. `npx prisma migrate deploy` در build step یا pre-deploy hook
3. بررسی `/api/v1/health/deep` پس از deploy

---

## ۷. مراجع

- [DATABASE_DESIGN.md](./phase-0/DATABASE_DESIGN.md)
- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
