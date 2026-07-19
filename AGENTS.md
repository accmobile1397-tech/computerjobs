# ComputerJobs.ir — Agent Instructions

## Mandatory: Read Before Any Work

1. Read [`.cto/RULEBOOK.md`](.cto/RULEBOOK.md) and relevant `.cto/*_RULES.md` files
2. Check [`docs/DECISIONS.md`](docs/DECISIONS.md) and [`docs/adr/`](docs/adr/)
3. Never start the next phase without CTO approval

## Code Structure

- Business logic: `src/modules/{feature}/`
- Infrastructure: `src/modules/shared/` (env, logger, prisma, redis, queue, storage)
- **Do not** use `src/lib/` for new code
- API routes in `src/app/api/` — thin handlers delegating to module services

## Git Workflow

**Commit directly on `main`.** No `develop`, no feature branches, no PR.

## CTO Handoff

Push to `main`, send **commit link** to CTO.  
See [`docs/reviews/CTO_HANDOFF.md`](docs/reviews/CTO_HANDOFF.md).

## Phase 1

**Identity & Access Management (IAM)** — see [`docs/phase-1/README.md`](docs/phase-1/README.md)

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
