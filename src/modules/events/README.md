# Events Module

Domain event bus per [RFC-003](../../../docs/rfc/RFC-003-EVENT-ARCHITECTURE.md).

| Path | Status |
|------|--------|
| `bus/` | P9-001 — in-memory EventBus |
| `catalog/` | P9-002 — event catalog v1 |
| `publishers/` | P9-003+ |
| `handlers/` | P9-011 |

Feature modules **publish only** — never call notification providers directly.
