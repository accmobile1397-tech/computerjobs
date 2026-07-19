# Authorization Module — Phase 1

**Separate from `auth/`** — authentication vs authorization.

| Responsibility | Module |
|----------------|--------|
| Login, tokens, password | `auth/` |
| Permission/role checks from DB | `authorization/` |

**Rule:** No hardcoded role or permission strings in business logic — load from database.

## Structure

```text
services/
  permission.service.ts   # hasPermission(userId, slug)
  role.service.ts         # load roles for user
repositories/
  permission.repository.ts
  role.repository.ts
types/
  authorization.types.ts
```
