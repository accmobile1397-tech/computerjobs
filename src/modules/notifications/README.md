# Notifications Module

Unified messaging per [RFC-004](../../../docs/rfc/RFC-004-NOTIFICATION-ARCHITECTURE.md).

| Path | Status |
|------|--------|
| Prisma models | P9-005 — templates · prefs · deliveries · event mappings |
| `gateway/` | P9-007 |
| `providers/` | P9-008+ |
| `handlers/` | P9-011 |
| `templates/` seed | P9-006 |

Feature modules **never** import providers — dispatch via gateway/handlers only.
