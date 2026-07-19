# Test Coverage — Phase 1

**Runner:** Vitest  
**Command:** `npm test`

## Results

| Suite | Tests | Status |
|-------|-------|--------|
| `crypto.util.test.ts` | 4 | ✅ Pass |
| `password.util.test.ts` | 1 | ✅ Pass |
| **Total** | **5** | **✅ Pass** |

## Covered

- Login identifier detection (email vs mobile)
- Email/mobile normalization
- argon2 hash + verify

## Not Covered (Phase 1 gap)

- Integration tests for API routes (requires MySQL test DB)
- Token rotation E2E
- RBAC permission matrix

**Recommendation:** Add API integration tests Phase 1.1 or Phase 2 with testcontainers.

## CI

GitHub Actions runs `npm test` on push/PR to main, develop, feature/*.
