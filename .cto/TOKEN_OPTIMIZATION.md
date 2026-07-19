# Token Optimization Mode

**Source of truth:** this file + `.cto/RULEBOOK.md`. Do not duplicate rulebook content elsewhere.

## Context loading

Load only:

1. `.cto/RULEBOOK.md` + specialized files **relevant to the task**
2. Current phase docs (`docs/phase-{N}/`)
3. Previous phase summary (README / CTO_REPORT / DECISIONS row) — not the full prior phase package

Do **not** re-read the entire repository each phase.

Analyze **only** changed modules and files.

## Spec & report generation

Default deliverables (unless CTO explicitly requests more):

| Artifact | When |
|----------|------|
| `TECHNICAL_SPEC` | Spec phase |
| `CTO_REPORT` | Implementation handoff / closeout |

Do **not** auto-generate DATABASE_DESIGN, API_DESIGN, SECURITY_REVIEW, RISKS, ACCEPTANCE, Guardian, Index, TEST_COVERAGE unless requested.

Rules:

- Never repeat rulebook content in specs or reports
- CTO_REPORT ≤ **300 lines**
- Prefer code changes over documentation generation
- Avoid verbose explanations

## Tests (minimal)

Per feature: happy path · validation · permission — nothing more unless CTO asks.

## Communication

Optimize for token efficiency while preserving architecture quality.
