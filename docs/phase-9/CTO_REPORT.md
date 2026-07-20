# CTO Report — Phase 9: Notification System

**Phase:** 9 · **Status:** 🟡 Implementation in progress  
**Spec:** [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) ✅ APPROVED (C-009-1..4)  
**Tasks:** [TASKS.md](./TASKS.md) · **Project status:** [AI_CTO_STATUS.md](../AI_CTO_STATUS.md)

## Progress

| Metric | Value |
|--------|-------|
| Tasks done | 10 / 15 |
| Last commit | `f830787` |
| Tests | 96/96 pass |
| Typecheck | green |
| Prisma validate | green |

## Completed tasks

### P9-001..P9-009 ✅ (CTO APPROVED)

### P9-010 InApp Provider + inbox ✅

- Migration: `20260720190000_phase9_notification_inbox`
- `InAppProvider` (`name: inapp`) — persists to `notifications` only
- `DeliveryResult` with `correlationId` + `providerMessageId` (`inapp_<uuid>`)
- Idempotent on `(eventId, ownerType, ownerId, templateKey, templateVersion)`
- Rejects non-IN_APP / non-USER|COMPANY recipients
- Gateway passes `eventId` · `templateKey` · `templateVersion` on rendered payload
- No API · handlers · read/unread · template rendering in provider
- 5 unit tests

---

## Notification data model (CTO review before P9-011)

### Entity map

| Model | Table | Role |
|-------|-------|------|
| `NotificationTemplate` | `notification_templates` | Registry — key/version/channel/locale/body |
| `NotificationPreference` | `notification_preferences` | Opt-in/out per owner × channel × category |
| `NotificationDelivery` | `notification_deliveries` | Per-dispatch audit trail (all channels) |
| `Notification` | `notifications` | **In-app inbox** (P9-010) — P9-012 reads this |
| `NotificationEventMapping` | `notification_event_mappings` | Event → template/channel rules (seed later) |

### `Notification` (inbox) fields

| Field | Notes |
|-------|-------|
| `ownerType` / `ownerId` | USER \| COMPANY |
| `templateKey` / `templateVersion` | From gateway |
| `title` / `content` | Already-rendered (subject/body) |
| `eventId` / `correlationId` | Trace + idempotency |
| `status` | Reuses `NotificationDeliveryStatus` (default SENT) |
| `providerMessageId` | Abstraction id |
| `deliveryId` | Optional FK → Delivery (reserved; not set in P9-010 yet) |
| `readAt` | Reserved for P9-012 (null = unread) |
| `deletedAt` | Soft delete |

**Unique:** `(eventId, ownerType, ownerId, templateKey, templateVersion)`

### Separation of concerns

```text
Gateway → render → providerPort.send(rendered)
  EMAIL/SMS stubs → log only
  InAppProvider → INSERT notifications (inbox)
Gateway → INSERT notification_deliveries (audit for all channels)
```

P9-012 User API must query `notifications` (not invent a parallel inbox).

## Debt (carry)

TD-NOTIF-1 · TD-NOTIF-2 · TD-EVT-1 · TD-ADMIN-1 · TD-P2-1

## Next

**P9-011 Handlers** — await CTO review of P9-010 inbox design.
