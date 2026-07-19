# Review Checklist

**CTO handoff:** [docs/reviews/CTO_HANDOFF.md](../docs/reviews/CTO_HANDOFF.md) — commit link on `develop` (no PR, no feature branch)

## Before Starting a Phase

- [ ] Read `.cto/RULEBOOK.md` + relevant specialized rules  
- [ ] Read `docs/adr/` for related decisions  
- [ ] Phase spec written and **human approved**  

## Before Completing a Phase

- [ ] All phase docs in `docs/phase-{N}/`  
- [ ] `CTO_REPORT.md` with commit hash + copy-paste handoff block
- [ ] `docs/reviews/PHASE_REVIEW_INDEX.md` updated  
- [ ] `docs/reviews/ARCHITECTURE_GUARDIAN.md` — 5 guardian questions answered  
- [ ] Conventional Commit(s) on `develop`  
- [ ] Push `develop` to origin  
- [ ] **Stop — wait for CTO review** (commit link)

## Product Owner → CTO

- [ ] Send commit link (+ `CTO_REPORT.md` if needed)

## CTO Decision

- [ ] APPROVE  
- [ ] APPROVE WITH CONDITIONS  
- [ ] REJECT  

## After APPROVE

- [ ] Merge `develop` → `main` when ready for production
- [ ] Update `docs/DECISIONS.md` phase status

## Phase 0 Status

**Closed** (2026-07-19) — APPROVE WITH CONDITIONS, all met — see D-018

## Phase 1 Status

**Awaiting CTO review** — commit [`392310c`](https://github.com/accmobile1397-tech/computerjobs/commit/392310c) on `develop`
