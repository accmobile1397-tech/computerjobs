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
npx prisma db seed
```

Phase 0: seed placeholder خالی — seed واقعی از Phase 2 (Location) و Phase 3 (Taxonomy) شروع می‌شود.

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
