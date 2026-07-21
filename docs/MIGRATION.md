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
