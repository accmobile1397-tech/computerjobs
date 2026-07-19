# ComputerJobs.ir — Agent Instructions

## Mandatory: Read Before Any Work

1. Read [`.cto/RULEBOOK.md`](.cto/RULEBOOK.md) — **Rulebook takes precedence**
2. Read the current phase docs in `docs/phase-{N}/`
3. Never start the next phase without explicit human approval after CTO review

## Phase Completion Checklist

Generate in `docs/phase-{N}/`:

- TECHNICAL_SPEC.md, ARCHITECTURE.md, DATABASE_DESIGN.md, API_DESIGN.md
- SECURITY_REVIEW.md, SEO_REVIEW.md, PHASE_SUMMARY.md
- **CTO_REPORT.md** (for human CTO review)

Then: Conventional Commit → push → **stop and wait for review**

## Architecture

Use `src/modules/{feature}/` — see Rulebook. Phase 0 used `src/lib/`; migrate from Phase 1.

## Deployment

OpenShip self-hosted VPS — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
