# Review Checklist

**CTO handoff:** [docs/reviews/CTO_HANDOFF.md](../docs/reviews/CTO_HANDOFF.md) — commit link on `main`

## Before Starting a Phase

- [ ] Read `.cto/RULEBOOK.md` + relevant specialized rules  
- [ ] Read `docs/adr/` for related decisions  
- [ ] Phase spec written and **human approved**  

## Before Completing a Phase

- [ ] All phase docs in `docs/phase-{N}/`  
- [ ] `CTO_REPORT.md` with commit hash + copy-paste handoff block
- [ ] `docs/reviews/PHASE_REVIEW_INDEX.md` updated  
- [ ] `docs/reviews/ARCHITECTURE_GUARDIAN.md` — 5 guardian questions answered  
- [ ] Conventional Commit(s) on `main`  
- [ ] Push `main` to origin  
- [ ] **Stop — wait for CTO review** (commit link)

## Product Owner → CTO

- [ ] Send commit link (+ `CTO_REPORT.md` if needed)

## CTO Decision

- [ ] APPROVE  
- [ ] APPROVE WITH CONDITIONS  
- [ ] REJECT  

## After APPROVE

- [ ] Update `docs/DECISIONS.md` phase status
- [ ] Proceed to next phase (still on `main`)

## Phase 0 Status

**Closed** (2026-07-19) — APPROVE WITH CONDITIONS, all met — see D-018

## Phase 1 Status

**Awaiting CTO review** — commit `66e08b9` on `main`
