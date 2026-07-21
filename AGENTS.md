# ComputerJobs.ir — Agent Instructions

## Mandatory: Read Before Any Work

1. Read [`.cto/RULEBOOK.md`](.cto/RULEBOOK.md) + relevant specialized files + [`.cto/TOKEN_OPTIMIZATION.md`](.cto/TOKEN_OPTIMIZATION.md)
2. Check [`docs/DECISIONS.md`](docs/DECISIONS.md), [`docs/ROADMAP.md`](docs/ROADMAP.md), and current phase docs only
3. Never start implementation without CTO spec approval
4. Default docs: `TECHNICAL_SPEC` (spec) · `CTO_REPORT` (handoff) — nothing else unless requested

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

**Roadmap SoT:** [`docs/ROADMAP.md`](docs/ROADMAP.md) (D-046)

| Phase | Status |
|-------|--------|
| 0 Foundation | 🟢 Closed |
| 1 IAM | 🟢 Closed (`v0.2-phase-1`) |
| 2 Profiles & Companies | 🟢 Closed (`v0.3-phase-2`) |
| 3 Location & Taxonomy | 🟢 Closed (`v0.4-phase-3`) |
| 4 Jobs Core | 🟢 Closed (`v0.5-phase-4`) |
| 5 Resume Builder | 🟢 Closed (`v0.6-phase-5`) |
| 6 Search & Matching | 🟡 Implemented · formal close/tag pending |
| 7A Entitlements | 🟢 Closed (`v0.7-phase-7A`) |
| 7B Payment Gateway | 🟢 Closed (`v0.8-phase-7B`) |
| 8 AI Gateway & Features | 🟢 Closed (`v0.9-phase-8`) |
| 8.1 Resume AI Suggest | ⏸ Deferred |
| **9** Notifications | 🟢 Closed (`v0.10-phase-9`) |
| **10** Admin Platform | 📋 Spec prep — **not authorized** |
| **11–15** | 📋 Planned — see ROADMAP |

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
