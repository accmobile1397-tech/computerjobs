# ADR-0007 (PROPOSAL): Migrate MySQL 8 → PostgreSQL 16

**Status:** Proposed (not accepted)  
**Date:** 2026-07-22  
**Deciders:** CTO, Engineering, DevOps (pending)  
**Supersedes (if accepted):** D-003 / [ADR-0002](./0002-prisma.md) DBMS choice · updates [ADR-0004](./0004-openship.md) data plane  

> **Numbering note:** ADR-0005 is already **Taxonomy Module Structure**. This proposal is filed as **ADR-0007** (next free ID after 0006-iam).

---

## Context

ComputerJobs.ir is an AI-Native hiring platform (Phases 0–12 closed through `v0.13-phase-12`). Current SoT is **Prisma 6 + MySQL 8** on **OpenShip VPS** (D-003 · ADR-0002 · ADR-0004).

Recent hosting confusion (Vercel `POSTGRES_*` vs Prisma `DATABASE_URL` / MySQL) raised whether to migrate to **PostgreSQL 16** for:

- Alignment with common managed Postgres / AI ecosystems  
- Future **pgvector** · semantic search · RAG  
- Phase 13+ Analytics / Phase 14 Recommendation / Phase 15 Advanced AI  

This ADR **proposes** a migration path and a **timing recommendation**. It does **not** authorize implementation.

---

## Current decision baseline (must not ignore)

| Artifact | Decision |
|----------|----------|
| D-003 · ADR-0002 | Prisma 6 + **MySQL 8** |
| ADR-0004 | OpenShip · Docker **MySQL** · no Vercel production |
| Schema / migrations | `provider = "mysql"` · lock file MySQL |
| Supabase | **Not used** anywhere |

---

## 1. Current MySQL dependencies

| Layer | Dependency |
|-------|------------|
| Prisma | `datasource.provider = "mysql"` · `env("DATABASE_URL")` with `mysql://` |
| Migrations | Full history under `prisma/migrations/` · `migration_lock.toml` = mysql |
| Native types | Widespread `@db.VarChar` · `@db.Text` · `Json` (MySQL JSON) |
| Docker | `mysql:8` service · volumes · healthchecks (`docker/docker-compose*.yml`) |
| CI | `.github/workflows/ci.yml` uses `DATABASE_URL=mysql://...` |
| Deploy docs | `docs/DEPLOYMENT.md` · OpenShip env examples MySQL |
| App code | No raw MySQL driver usage found beyond Prisma; dialect risk is mostly **Prisma schema + SQL migrations** |
| Search today | App-level / Phase 6 search — **not** MySQL FULLTEXT-centric as primary product search |

**Not dependencies:** Supabase · Prisma Postgres URLs · Vercel Postgres.

---

## 2. Prisma migration impact

If accepted, approximate work:

| Workstream | Impact |
|------------|--------|
| Schema | Change `provider` → `postgresql`; review every `@db.*` attribute for PG equivalents |
| Migrations | **Cannot** keep MySQL migration chain as-is. Options: (A) baseline squash new PG init migration from introspected schema, or (B) regenerate empty history + one-shot load — both need a freeze window |
| Client | `prisma generate` / CI unchanged in shape; URL becomes `postgresql://` |
| Features | Enums, JSON, UUIDs generally fine; watch **case sensitivity**, **string comparison**, **JSON path**, **LIMIT/OFFSET** already portable |
| Raw SQL | Audit any `$queryRaw` / `$executeRaw` for MySQL-specific SQL (must be inventoried before migrate) |
| Prisma version | Stay on Prisma 6 unless a separate ADR upgrades to 7 |

**Effort class:** medium–large (schema + data + ops), not a one-line env change.

---

## 3. Docker / OpenShip impact

| Component | Change |
|-----------|--------|
| Compose | Replace `mysql:8` with `postgres:16` · new volume · healthcheck (`pg_isready`) · port 5432 |
| Secrets | New `POSTGRES_USER/PASSWORD/DB` or single `DATABASE_URL` |
| OpenShip | Redeploy data service; update app env `DATABASE_URL=postgresql://...` |
| Backups | Replace `mysqldump` runbooks with `pg_dump` / continuous backup policy |
| Rollback | Keep MySQL volume snapshot until PG cutover proven |

ADR-0004 remains “OpenShip VPS”; only the **DBMS image** changes — still self-hosted, still no requirement for Vercel/Supabase.

---

## 4. CI/CD impact

| Item | Change |
|------|--------|
| GitHub Actions | Spin Postgres 16 service (or container) · set `DATABASE_URL=postgresql://...` |
| Migrate job | `prisma migrate deploy` against PG |
| Seed | Re-validate seeds (MySQL vs PG differences in defaults/collation) |
| Preview deploys | If any Vercel preview exists: use **Postgres** only after ADR accept — do **not** mix MySQL prod + Postgres preview without explicit dual-support policy |

---

## 5. Data migration strategy (proposed)

**Recommended pattern for this codebase (green-enough history, phase tags through v0.13):**

1. **Freeze writes** (maintenance window) or dual-write period (higher complexity — not recommended for first cut).  
2. **Export** MySQL (logical dump or per-table CSV/JSON via script).  
3. **Provision** Postgres 16 on OpenShip compose.  
4. **Apply** new Prisma PG baseline migration (empty DB).  
5. **Load** data with ID preservation (UUIDs) · FK order · verify row counts.  
6. **Validate** app smoke + Validation Sprint P0 tracks against PG.  
7. **Cutover** DNS/app `DATABASE_URL` · monitor.  
8. **Retain** MySQL snapshot ≥ N days for rollback.

**Tools (examples, not mandated):** `pgloader` (MySQL→PG), custom Prisma-based ETL, or dump/transform/load.

**Hard rule:** Do not point production Prisma MySQL schema at a Postgres URL.

---

## 6. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Migration history rewrite / drift | High | Squash baseline + checksum inventory; never edit old MySQL migrations in place for PG |
| Silent SQL dialect bugs | High | Raw SQL audit · full regression · Validation Sprint on PG |
| Downtime / data loss | High | Freeze · verified backups · staged cutover |
| Collation / Persian text sort | Medium | Explicit collations · sort tests on `nameFa` |
| JSON / enum edge cases | Medium | Fixture tests per domain |
| Schedule slip into Phase 13 | High | Treat as **infra ADR phase**, not a side task inside Analytics |
| Premature pgvector adoption | Medium | Ship PG first; add pgvector in a **follow-up ADR** when embedding pipeline exists |
| Dual environment confusion (Vercel PG vs OpenShip MySQL) | Medium | Single SoT: OpenShip only until ADR-0004 revised |

---

## 7. Benefits for AI-first roadmap (pgvector · semantic search · RAG)

| Capability | On MySQL 8 today | On PostgreSQL 16 |
|------------|------------------|------------------|
| Vector similarity (pgvector) | Not native; external store (e.g. Qdrant/Pinecone) or app-side | First-class extension · same DB transactions |
| Semantic job/resume search | Would need external ANN | Can colocate embeddings + relational filters |
| RAG over jobs/taxonomies/docs | External vector DB | PG + pgvector (+ optional dedicated search later) |
| Hybrid filters (city + vector) | Join across systems | Single query planner |
| Analytics (Phase 13) | Fine on MySQL | Also fine; PG not required for analytics alone |
| Recommendation (Phase 14) | Possible either way | Vectors in-DB simplify MVP |

**Important:** Migrating to Postgres **enables** pgvector; it does **not** deliver semantic search by itself. Still need embedding pipeline, model choice, index strategy, and product UX (likely Phase 14/15 + RFCs).

---

## Decision options

### Option A — Migrate **now** (before Phase 13)

**Pros:** Clean slate before Analytics; avoid building Phase 13 on DBMS you intend to leave; earlier pgvector runway.  
**Cons:** Blocks/distracts Validation Sprint; highest risk window right after Phase 12 close; Phase 13 delayed; no embedding product yet to justify urgency.

### Option B — Migrate **after Validation Sprint** (recommended default)

**Pros:** Stabilize MySQL production path first (OpenShip + `DATABASE_URL`); complete P0 validation; then schedule a dedicated “DBMS cutover” mini-phase with acceptance tests.  
**Cons:** Short period still on MySQL; Phase 13 may start on MySQL and need careful “no PG-only features” until cutover.

### Option C — Defer until Phase 14/15 (vectors needed)

**Pros:** Migrate when product pulls for embeddings.  
**Cons:** Larger dual-tech debt if Analytics hard-codes MySQL assumptions; Vercel/Postgres confusion may recur.

---

## 8. Recommendation

**Recommend: Option B — complete Validation Sprint on MySQL, then migrate to PostgreSQL 16 under this ADR (if accepted), before deep Phase 13 analytics build-out if vectors are on the 6-month roadmap.**

Rationale:

1. **ADR-0004 production target is OpenShip + MySQL today** — fix env/ops first; do not migrate because Vercel injected `POSTGRES_*`.  
2. **Validation Sprint** (auth→security) needs a stable DBMS; migrating mid-sprint doubles failure modes.  
3. **AI benefits are real but not blocking Phase 13 Analytics** — analytics can ship on MySQL; pgvector is decisive for Recommendation/RAG.  
4. If CTO’s 2-quarter plan **requires** in-DB vectors before Recommendation, accept ADR-0007 **immediately after** Validation Sprint exit criteria, as a **named cutover**, not as Phase 13 scope creep.

**Do not migrate “now” before Validation Sprint** unless CTO accepts explicit schedule slip and freeze risk.

---

## Consequences (if accepted later)

- **Positive:** Modern PG 16 · pgvector path · clearer AI data plane · fewer Vercel Postgres mismatches  
- **Negative:** One-time cutover cost · supersede D-003 DBMS · rewrite migration SoT · ops retrain  
- **Neutral:** Prisma remains ORM; OpenShip remains deploy host  

## Consequences (if rejected)

- Stay MySQL 8 · keep ADR-0002/0004  
- AI vectors via **external** store when needed  
- Document Vercel as non-production / unsupported for DB

---

## Implementation outline (only after APPROVE)

1. CTO **ACCEPT** this ADR (new decision ID).  
2. Inventory raw SQL + MySQL-specific Prisma attributes.  
3. Draft cutover runbook + rollback.  
4. PG compose + CI.  
5. Baseline Prisma PG migration.  
6. Data load + Validation Sprint P0 on staging PG.  
7. Production cutover.  
8. Follow-up ADR for **pgvector** extension + embedding schema (do not bundle blindly).

---

## Alternatives considered

| Alternative | Why not (for now) |
|-------------|-------------------|
| Stay MySQL forever | Viable; weaker native vector story |
| Migrate before Validation Sprint | Unnecessary risk; ops not green |
| Adopt Supabase as primary DB | Not in architecture; couples to SaaS; conflicts with OpenShip-first unless ADR-0004 revised |
| Dual-write MySQL+PG | High complexity; not needed for current scale |

---

## References

- [ADR-0002](./0002-prisma.md) · [ADR-0004](./0004-openship.md) · D-003 · D-002  
- [docs/DEPLOYMENT.md](../DEPLOYMENT.md) · [docs/VALIDATION_SPRINT.md](../VALIDATION_SPRINT.md)  
- [docs/phase-13/PHASE_13_CTO_HANDOFF.md](../phase-13/PHASE_13_CTO_HANDOFF.md)
