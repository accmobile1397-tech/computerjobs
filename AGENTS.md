# ComputerJobs.ir — Agent Instructions

## Mandatory: Read Before Any Work

1. Read [`.cto/RULEBOOK.md`](.cto/RULEBOOK.md) and relevant `.cto/*_RULES.md` files
2. Check [`docs/DECISIONS.md`](docs/DECISIONS.md) and [`docs/adr/`](docs/adr/)
3. Never start implementation without CTO spec approval

## Code Structure

- Business logic: `src/modules/{feature}/`
- Infrastructure: `src/modules/shared/` (env, logger, prisma, redis, queue, storage)
- **Do not** use `src/lib/` for new code
- API routes in `src/app/api/` — thin handlers delegating to module services

## Git Workflow

**Commit directly on `main`.** No feature branches, no PR.

## CTO Handoff

Push to `main`, send **commit link** to CTO.  
See [`docs/reviews/CTO_HANDOFF.md`](docs/reviews/CTO_HANDOFF.md).

## Phase Status

| Phase | Status |
|-------|--------|
| 0 Foundation | 🟢 Closed |
| 1 IAM | 🟢 Closed (`v0.2-phase-1`) |
| 2 Profiles & Companies | 🟢 Closed (`v0.3-phase-2`) |
| 3 Location & Taxonomy | ⏳ Implementation — **awaiting CTO review** |

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
