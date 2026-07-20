# Phase 9 — Task Tracker

**Purpose:** If Cursor context resets, read **this file only** + [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) to resume.

**Workflow (per task):**
1. Implement **one** task → green tests + typecheck
2. Update this file (status + commit ref)
3. Update [CTO_REPORT.md](./CTO_REPORT.md)
4. Commit on `main` — do **not** start next task until current is DONE

**Status values:** `OPEN` · `IN_PROGRESS` · `DONE` · `BLOCKED`

| ID | Task | Status | Commit | Notes |
|----|------|--------|--------|-------|
| P9-001 | EventBus | DONE | `828f751` | `src/modules/events/bus/` in-memory |
| P9-002 | Event Catalog | DONE | `2b33999` | `catalog/v1.ts` SoT · 16 events · 6 MVP |
| P9-003 | Payment Publisher | DONE | `097d86b` | `payment.succeeded` after webhook settle |
| P9-004 | Job Publisher | DONE | `cb4bb04` | `job.application.submitted` after apply |
| P9-005 | Notification Tables | OPEN | — | migration · no schema in spec doc |
| P9-006 | Notification Templates | OPEN | — | seed + registry |
| P9-007 | Gateway | OPEN | — | pipeline · correlationId · idempotency |
| P9-008 | Email Provider | OPEN | — | stub adapter |
| P9-009 | SMS Provider | OPEN | — | stub adapter |
| P9-010 | InApp Provider | OPEN | — | inbox persistence |
| P9-011 | Handlers | OPEN | — | event → dispatch mappers |
| P9-012 | User API | OPEN | — | inbox · preferences |
| P9-013 | Admin API | OPEN | — | templates · mapping · delivery viewer |
| P9-014 | Permissions | OPEN | — | IAM seed · audit enums |
| P9-015 | Tests | OPEN | — | gateway · idempotency · correlationId |

---

## Progress

- **Done:** 4 / 15
- **Current:** none — await review before **P9-005**
- **Blocked:** —

---

## Agent instructions (frozen)

```
Phase 9 Spec is frozen and implementation is authorized.

Follow docs/phase-9/IMPLEMENTATION_PLAN.md exactly.
Work in very small commits.
Implement one task at a time.

After every completed task:
  - run tests
  - run typecheck
  - update docs/phase-9/TASKS.md
  - update docs/phase-9/CTO_REPORT.md
  - commit

Do not continue to the next task until the current task is green.
Keep all implementation diff-only.
Never modify completed phases unless strictly required.
```
