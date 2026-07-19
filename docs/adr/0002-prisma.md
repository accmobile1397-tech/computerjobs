# ADR-0002: Prisma 6 with MySQL 8

**Status:** Accepted  
**Date:** 2026-07-19  
**Deciders:** CTO, Engineering  

## Context

Prisma 7 introduces breaking config changes (datasource URL in `prisma.config.ts`). Phase 0 hit validation errors on Prisma 7.

## Decision

Use **Prisma 6.x** + **MySQL 8** until a dedicated upgrade phase with ADR update.

- UUID primary keys  
- Audit fields on all business tables  
- Migrations never edited after merge  

## Consequences

- **Positive:** Stable migrate/generate workflow  
- **Negative:** Future upgrade work tracked explicitly  
- **Neutral:** Client singleton at `modules/shared/prisma/client.ts`  

## Alternatives Considered

- Prisma 7 immediately — rejected (instability, Phase 0 blocker)  
- Drizzle ORM — rejected (Rulebook specifies Prisma)  

See `.cto/PRISMA_RULES.md`.
