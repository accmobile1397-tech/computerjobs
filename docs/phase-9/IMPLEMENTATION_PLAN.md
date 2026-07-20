# Phase 9 — Implementation Plan (no code yet)

**Spec:** [TECHNICAL_SPEC.fa.md](./TECHNICAL_SPEC.fa.md) ✅ APPROVED  
**Prerequisites:** RFC-003 · RFC-004 · RFC-005 ✅ CLOSED

Implement on `main` in **small commits**. Reuse existing: `shared/queue`, `auth/audit`, `billing` patterns, IAM seed.

---

## Commit sequence (recommended)

| # | Scope | Module / path |
|---|--------|----------------|
| 1 | EventBus skeleton + catalog v1 (in-process) | `src/modules/events/` |
| 2 | Wire first publishers: `payment.succeeded`, `job.application.submitted` | billing · jobs (publish only) |
| 3 | Notification models migration + seed templates + mapping v1 | prisma · notifications seed |
| 4 | Gateway pipeline (idempotency, prefs, render, correlationId) | `notifications/gateway/` |
| 5 | Providers: stub · email · sms · inapp (+ push stub) | `notifications/providers/` |
| 6 | Event handlers → dispatch | `notifications/handlers/` |
| 7 | User APIs: inbox · preferences | `app/api/v1/notifications/` |
| 8 | Admin APIs: templates · mapping · delivery viewer | `app/api/v1/admin/notifications/` |
| 9 | IAM permissions seed · audit enum extensions | `prisma/seed.ts` |
| 10 | Unit tests (gateway idempotency, prefs skip, correlationId) | `notifications/*.test.ts` |

---

## HARD RULES (do not violate)

1. Feature modules **publish events only** — never call SMS/Email providers.
2. All delivery via **Notification Gateway**.
3. Templates from **registry** (DB/seed) — no inline strings in services.
4. **Preferences** checked before send.
5. **`correlationId`** propagated event → delivery → audit.
6. Mapping config uses **`{ version, mappings }`** shape.

---

## Phase 9 MVP event → notification set

| Event | Channels (seed) |
|-------|-----------------|
| `job.application.submitted` | EMAIL + IN_APP |
| `payment.succeeded` | EMAIL |
| `subscription.activated` | EMAIL + IN_APP |
| `contact.unlocked` | IN_APP |
| `ai.request.completed` | IN_APP |
| `ai.request.failed` | IN_APP |

---

## Reserved (no Phase 9 impl)

- `NotificationPriority` behavior in queue
- Channel capability matrix enforcement in runtime
- WEBHOOK channel (TD-NOTIF-1)
- Digest engine (TD-NOTIF-2)
- Push real delivery (stub only)

---

## Done criteria (for CTO_REPORT)

- [ ] EventBus + 6 handlers wired
- [ ] Email · SMS · In-App deliver via stub/real adapter config
- [ ] Push stub returns SKIPPED or logged
- [ ] Preferences opt-out works
- [ ] Idempotency 24h on `(eventId, channel, recipient, templateKey)`
- [ ] `correlationId` traceable in delivery + audit
- [ ] Admin can list deliveries + manage templates/mapping
- [ ] Tests green · typecheck green
- [ ] No feature module imports notification providers
