# Review Checklist

**CTO handoff:** [docs/reviews/CTO_HANDOFF.md](../docs/reviews/CTO_HANDOFF.md) — `CTO_REPORT.md` + commit hash (PR optional)

## Before Starting a Phase

- [ ] Read `.cto/RULEBOOK.md` + relevant specialized rules  
- [ ] Read `docs/adr/` for related decisions  
- [ ] Phase spec written and **human approved**  

## Before Completing a Phase

- [ ] All phase docs in `docs/phase-{N}/`  
- [ ] `CTO_REPORT.md` with:
  - **Commit hash** (implementation)
  - Architecture Review  
  - Security Review  
  - Database Review  
  - SEO Review  
  - Risks  
  - Technical Debt  
  - Recommendations  
  - **Handoff message** block for Product Owner → CTO
- [ ] `docs/reviews/PHASE_REVIEW_INDEX.md` updated for this phase  
- [ ] `docs/reviews/ARCHITECTURE_GUARDIAN.md` — 5 guardian questions answered  
- [ ] Conventional Commit(s) on `feature/*`  
- [ ] Push branch to origin  
- [ ] **Stop — wait for CTO human review** (via `CTO_REPORT.md`, not PR)

## Product Owner → CTO

- [ ] Send `docs/phase-N/CTO_REPORT.md` + commit hash (see handoff template in report)

## CTO Decision

- [ ] APPROVE  
- [ ] APPROVE WITH CONDITIONS  
- [ ] REJECT  

## After APPROVE

- [ ] Merge `feature/*` → `develop` (direct merge OK — PR not required)
- [ ] Update `docs/DECISIONS.md` phase status

## Phase 0 Status

**Closed** (2026-07-19) — APPROVE WITH CONDITIONS, all met — see D-018

## Phase 1 Name

**Identity & Access Management (IAM)** — not auth-only.

## Phase 1 Status

**Awaiting CTO review** — handoff via [CTO_REPORT.md](../docs/phase-1/CTO_REPORT.md) commit `769b6de` on `feature/auth`
