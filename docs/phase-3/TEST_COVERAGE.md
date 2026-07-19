# Test Coverage — Phase 3

| Area | Tests |
|------|-------|
| slug.util (Phase 1–2) | 4 |
| completion-score.util (incl. cityId) | 3 |
| crypto.util | 2 |
| password.util | 3 |
| taxonomy aliases helper | 2 |
| Phase 2 audit action registry | 1 |

**Total:** 16 unit tests — `npm test` green

## Phase 2 Carryover (TD-P2-1)

| Flow | Status |
|------|--------|
| Profile API integration | 📋 Checklist in `phase2-audit.integration.test.ts` |
| Company API integration | 📋 Checklist |
| Invite flow | 📋 Checklist |
| Ownership transfer | 📋 Checklist |

Full HTTP integration tests deferred to CI with test DB (Phase 3 close condition).

## CI

GitHub Actions on push to `main`: lint, typecheck, prisma validate, test, build
