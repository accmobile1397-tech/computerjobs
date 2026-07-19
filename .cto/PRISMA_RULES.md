# Prisma Rules

## Version

- Prisma **6.x** (stable) — see ADR-0002 before upgrading to 7  

## Schema Location

- `prisma/schema.prisma`  
- Business models live in schema; access only via module repositories/services  

## Migrations

- **Never** edit existing migration files  
- Always `prisma migrate dev --name descriptive_name`  
- Production: `prisma migrate deploy` after backup  

## Client

- Singleton in `src/modules/shared/prisma/client.ts`  
- Do not instantiate `PrismaClient` elsewhere  

## Seeds

- `prisma/seed.ts` orchestrates module seeds  
- Location seed → `src/modules/location/seed/`  
- Taxonomy seed → Phase 3  

## Queries

- Default filter `deletedAt: null` for soft-deleted models  
- Use transactions for multi-table business operations  

See [docs/adr/0002-prisma.md](../docs/adr/0002-prisma.md) and [docs/MIGRATION.md](../docs/MIGRATION.md).
