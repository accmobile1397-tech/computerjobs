# Token Optimization Mode

**Source of truth:** this file + `.cto/RULEBOOK.md`.

## Context loading (mandatory)

1. `.cto/RULEBOOK.md` + **only** specialized files relevant to the task  
2. **Current phase spec only** (`docs/phase-{N}/` or `phase-7b/`) — not prior full packages  
3. Previous phase: README / CTO_REPORT / DECISIONS row at most  

**Do not** re-scan the entire repository each phase.

## Diff-first (Billing · Payment · AI Gateway onward)

From Phase 7B / costly domains:

- Work **diff-only** — read and edit **involved files** only  
- Prefer `git diff` / path-scoped search over broad exploration  
- Do not reload unrelated modules (jobs/resumes/taxonomy) unless the task touches them  
- Before each phase: load **that phase’s TECHNICAL_SPEC** (+ RFC if cited) only  

## Spec & report defaults

| Artifact | When |
|----------|------|
| `TECHNICAL_SPEC` | Spec phase |
| `CTO_REPORT` | Handoff / closeout |

Extra docs only if CTO requests. Never repeat rulebook in specs. CTO_REPORT ≤ 300 lines.

## Tests (minimal)

Happy path · validation · permission

## Communication

Token-efficient; preserve architecture quality.
