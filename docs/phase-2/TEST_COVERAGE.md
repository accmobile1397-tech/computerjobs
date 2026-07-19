# Test Coverage — Phase 2

| Area | Tests |
|------|-------|
| slug.util | 4 |
| completion-score.util | 2 |
| crypto.util (Phase 1) | 2 |
| password.util (Phase 1) | 3 |

**Total:** 11 unit tests — `npm test` green

## Not covered (deferred)

- API integration tests (P1 — TD-P2-1)
- E2E profile/company flows

## CI

GitHub Actions on push to `main`: lint, typecheck, prisma validate, test, build
