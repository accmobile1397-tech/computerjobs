# Test Coverage — Phase 4

| Area | Tests |
|------|-------|
| slug.util | 4 |
| completion-score.util | 3 |
| crypto.util | 2 |
| password.util | 3 |
| taxonomy.service | 2 |
| phase2 audit checklist | 2 |
| job enums (Phase 4 CTO conditions) | 3 |

**Total:** 19 unit tests — `npm test` green

## Not covered (deferred)

- Full HTTP integration tests for job/application flows (TD-P2-1 carryover)
- E2E job posting workflow

## CI

GitHub Actions on push to `main`: lint, typecheck, prisma validate, test, build
