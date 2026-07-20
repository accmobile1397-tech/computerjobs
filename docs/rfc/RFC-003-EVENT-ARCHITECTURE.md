# RFC-003 — Event Architecture

**Status:** ✅ **APPROVED / FROZEN / CLOSED** (CTO APPROVE WITH CONDITIONS — C-003-1/2 applied 2026-07-20)  
**ID:** RFC-003 · **Decision:** D-047  
**Audience:** ComputerJobs.ir post-Phase 8 — cross-module foundation  
**Depends on:** RFC-001 (invariants) · existing `AuditLog` · BullMQ (`shared/queue`)  
**Blocks:** RFC-004 (Notifications) · Phase 9 · Phase 13 (Analytics)

---

## 1. Purpose

Freeze a unified **domain event** architecture before Notifications, Admin dashboards, and Analytics multiply ad-hoc callbacks.

**Deliverables (architecture only — no full consumer implementation in this RFC):**

- `EventBus` abstraction (sync + async dispatch)  
- Event naming + envelope contract  
- Publisher / consumer ownership rules  
- Initial **event catalog** (v1)  
- Audit vs domain-event separation  
- Queue handoff contract for Phase 9+  

**Non-goal:** Implementing every consumer, analytics warehouse, or replacing all existing `writeAuditLog` calls in one phase.

---

## 2. Principles

1. **Domain events ≠ audit logs** — Audit is compliance/security trail; events are product/integration signals. Many flows emit **both**.
2. **Publish after commit** — Events fire only after the owning transaction succeeds (no phantom events).
3. **At-least-once async** — Handlers must be idempotent (`eventId` dedupe).
4. **PII minimization** — Payloads use ids/slugs; no raw email/mobile in event body (resolve at consumer).
5. **Data-driven routing** — Which handlers run for which event comes from config/registry, not scattered `if` in feature code.
6. **Feature modules publish; they do not notify** — Jobs never call SMS/Email directly (RFC-004).
7. **Diff-only evolution** — New event = new catalog entry + optional handler; no cross-module imports for side effects.

---

## 3. HARD RULE — Publisher ownership

**Only the module that owns the aggregate may publish its domain events.**

| Module | May publish | Must NOT publish |
|--------|-------------|------------------|
| `jobs/` | `job.*` | `payment.*`, `notification.*` |
| `resumes/` | `resume.*` | `job.*` |
| `billing/` | `subscription.*`, `wallet.*`, `quota.*`, `contact_unlock.*` | `job.*` |
| `billing/` (payments) | `payment.*` | settle side effects in jobs |
| `ai/` | `ai.request.*` | direct notification |
| `auth/` | `user.*`, `session.*` | billing events |
| `companies/` | `company.*` | job lifecycle |

**Forbidden:** Feature service → `notifications.send()` or `smsProvider.send()` directly.  
**Required:** Feature service → `eventBus.publish()` → notification handler (Phase 9).

---

## 4. Module layout (frozen)

```text
src/modules/events/
  bus/              # EventBus interface + default impl
  catalog/          # EVENT_NAMES, schemas, version map
  publishers/       # thin helpers per domain (optional)
  handlers/         # registered consumers (Phase 9+ grow here)
  types/
  persistence/      # DomainEvent log table (Phase 9 impl detail)
```

Infrastructure: `src/modules/shared/queue/` — BullMQ connection only.  
Event queue name prefix: `events:` (e.g. `events:dispatch`).

---

## 5. Event envelope (Requirement)

Every published event **must** use this envelope:

```text
DomainEvent {
  eventId: string           // UUID — idempotency key (24h min retention)
  name: string              // dot.case — see §6
  version: number           // payload schema version (start at 1)
  occurredAt: string        // ISO-8601 UTC
  actorUserId?: string      // who triggered (if any)
  aggregateType: string     // Job | Resume | Payment | ...
  aggregateId: string
  correlationId?: string    // requestId / checkout id / ai requestId
  payload: Record<string, unknown>  // versioned, PII-redacted
}
```

### C-003-1 — Mandatory event versioning (HARD RULE)

**Every event schema change MUST bump `version`.** Handlers register against `(name, version)`.

Preferred form (frozen):

```text
name = "job.published"
version = 2          // integer — increment on any breaking or material payload change
```

Alternative catalog key (documentation only): `job.published.v2` maps to `name` + `version=2`.

Rules:

- **Additive optional fields** on payload: may stay same version if all consumers tolerate unknown keys; CTO recommends bump when in doubt.
- **Remove/rename/retype field:** MUST bump version.
- **New handler** for old version allowed alongside new version during migration window.
- Publishers MUST set `version` explicitly — never omit (default `1` only for first release).
- Catalog entry documents payload JSON Schema per `(name, version)`.

Violations blocked in review.

### C-003-2 — Central Event Registry (reserved)

**TD-EVT-1:** Central Event Registry service — schema registry, compatibility checks, discovery UI.  
**Not implemented in Phase 9.** Phase 9 uses file catalog (`catalog/v1.ts`) + `docs/events/EVENT_CATALOG.md` until registry debt is opened.

### Naming convention

Format: `{domain}.{action}` in **lowercase dot.case**.

Examples:

- `job.published` · `job.closed` · `job.application.submitted`  
- `resume.created` · `resume.viewed`  
- `contact.unlocked`  
- `payment.succeeded` · `payment.failed`  
- `subscription.activated` · `subscription.canceled`  
- `ai.request.completed` · `ai.request.failed`  
- `company.verified` · `user.registered`  

**Forbidden:** `JobPublished`, `JOB_PUBLISHED`, mixed casing.

---

## 6. Event catalog v1 (frozen list — extend via catalog file)

| Event name | Publisher module | When | Key payload fields |
|------------|------------------|------|---------------------|
| `job.published` | jobs | Status → PUBLISHED | jobId, companyId, slug |
| `job.closed` | jobs | Status → CLOSED | jobId, companyId |
| `job.application.submitted` | jobs | Application created | jobId, applicationId, userId |
| `resume.created` | resumes | First ACTIVE resume | resumeId, userId |
| `resume.updated` | resumes | Material update | resumeId, userId |
| `resume.viewed` | resumes / billing | Employer view consumed | resumeId, viewerCompanyId |
| `contact.unlocked` | billing | ContactUnlock row | companyId, targetUserId, unlockId |
| `payment.succeeded` | billing | Webhook settle OK | paymentId, ownerType, ownerId, sku |
| `payment.failed` | billing | Verify/settle fail | paymentId, reasonCode |
| `subscription.activated` | billing | New/renewed ACTIVE | subscriptionId, planSlug, ownerType, ownerId |
| `subscription.canceled` | billing | Cancel | subscriptionId |
| `quota.exceeded` | billing | Gate blocked (optional) | featureKey, ownerType, ownerId |
| `ai.request.completed` | ai | Gateway success | featureKey, requestId, creditsCaptured |
| `ai.request.failed` | ai | Gateway fail | featureKey, requestId, errorCode |
| `company.verified` | companies | Verification → VERIFIED | companyId |
| `user.registered` | auth | Register complete | userId, primaryType |

Catalog source file (Phase 9 impl): `src/modules/events/catalog/v1.ts` + `docs/events/EVENT_CATALOG.md`.

---

## 7. EventBus contract

```text
EventBus {
  publish(event: DomainEvent): Promise<void>
    // sync: validate envelope, persist optional outbox, dispatch in-process handlers
    // async: enqueue to BullMQ for registered async handlers

  registerHandler(
    eventName: string,
    handler: EventHandler,
    options?: { async?: boolean; idempotent?: boolean }
  ): void
}

EventHandler(ctx: {
  event: DomainEvent
  logger: Logger
}): Promise<void>
```

### Dispatch pipeline (frozen order)

```text
1. validateEnvelope(name, version, payload schema)
2. assign eventId if missing
3. optional: append DomainEventOutbox row (same TX as business write — Phase 9)
4. writeAuditLog when mapped (see §8) — same request, separate concern
5. run sync handlers (in-process, ordered)
6. enqueue async handlers to BullMQ queue `events:dispatch`
7. handler failure: retry with backoff; dead-letter after N tries (SystemSetting)
```

Phase 8/9 MVP may start with **in-process bus only** + audit; outbox table is Phase 9 TECHNICAL_SPEC detail — **behavior** (publish-after-commit) is frozen here.

---

## 8. Audit integration

**AuditLog remains** for security/compliance. **Domain events** feed product flows.

| Concern | AuditLog | Domain event |
|---------|----------|--------------|
| Admin forensic | ✅ primary | optional duplicate |
| Notification trigger | ❌ | ✅ primary |
| Analytics funnel | ❌ | ✅ primary |
| Billing money trail | ✅ primary | mirror optional |

Rules:

- Existing `AuditAction` values **stay** (see [AUDIT_EVENT_CATALOG](../phase-7/AUDIT_EVENT_CATALOG.md)).
- When both apply: service writes audit **then** publishes event (or same outbox TX).
- Event payload **must not** duplicate full audit metadata; use ids + correlationId.
- New product-facing signals prefer **new domain events** over new audit enums when the audience is handlers/analytics (audit enum only if compliance requires).

Mapped pairs (examples):

| AuditAction | Domain event |
|-------------|--------------|
| `JOB_PUBLISHED` | `job.published` |
| `CONTACT_UNLOCKED` | `contact.unlocked` |
| `PAYMENT_SUCCEEDED` | `payment.succeeded` |
| `AI_REQUEST_COMPLETED` | `ai.request.completed` |

---

## 9. Analytics integration (reserved)

Phase 13 consumes **domain events** (or event log projection), not raw audit tables.

Reserved:

- `SystemSetting` `analytics.eventRetentionDays`  
- Table `AnalyticsEvent` or stream export — **deferred** until Phase 13 spec  
- Handlers may write lightweight counters to Redis in Phase 9+ if CTO approves in spec  

RFC-003 only freezes: **analytics reads events, not feature-module hooks**.

---

## 10. Queue integration

| Setting key | Purpose | Seed |
|-------------|---------|------|
| `events.async.enabled` | Enable BullMQ dispatch | `true` |
| `events.handler.maxRetries` | Retry count | `5` |
| `events.handler.backoffMs` | Base backoff | `1000` |
| `events.outbox.pollCron` | Outbox drain job | `*/1 * * * *` |

Queue job payload: full `DomainEvent` envelope.  
Workers live under `src/modules/events/handlers/` or feature-owned handler files registered at bootstrap.

**Idempotency:** Handler stores processed `(eventId, handlerName)` with TTL ≥ 24h (Redis or DB — Phase 9 detail).

---

## 11. Consumer ownership (Phase 9+)

| Consumer | Subscribes to (examples) | Module |
|----------|---------------------------|--------|
| Notification dispatcher | `job.*`, `payment.succeeded`, `contact.unlocked`, … | notifications |
| Admin activity feed (future) | `company.verified`, `job.published` | admin |
| Analytics projector (Phase 13) | `*` (filtered) | analytics |
| Internal metrics | `ai.request.*`, `payment.*` | shared/observability |

Handlers **register** at app bootstrap — no dynamic import from feature routes.

---

## 12. Explicit non-goals

- Event sourcing as primary persistence model  
- Kafka / external broker (BullMQ + MySQL sufficient until scale RFC)  
- Replacing all audit writes in Phase 9  
- Guaranteed exactly-once delivery (at-least-once + idempotent handlers)  
- Public webhook fan-out to employers (future RFC)  

---

## 13. Relation to downstream RFCs / phases

| Downstream | Requires RFC-003 |
|------------|------------------|
| RFC-004 Notifications | ✅ events as triggers |
| Phase 9 | ✅ EventBus + catalog v1 |
| RFC-005 Admin | recommended (activity feed) |
| Phase 10 | admin viewer may read audit + event log |
| Phase 13 Analytics | ✅ event stream contract |

**No Phase 9 coding until RFC-003 FROZEN** (done). Phase 9 TECHNICAL_SPEC cites this RFC.

Phase 9 TECHNICAL_SPEC cites this RFC and only details: outbox schema, first handlers, notification wiring.

---

## 14. Migration from current code

Incremental — no big-bang:

1. Introduce `EventBus` + catalog (no callers).  
2. Wire `billing` payment succeed → `payment.succeeded`.  
3. Wire `ai` gateway → `ai.request.completed|failed`.  
4. Phase 9: notification handler subscribes; remove any direct notification stubs.  

Existing direct `writeAuditLog` calls **remain valid** during migration.

---

## CTO Decision Log

| Date | Decision |
|------|----------|
| 2026-07-20 | APPROVE WITH CONDITIONS (C-003-1 versioning · C-003-2 TD-EVT-1 reserved) |
| 2026-07-20 | Conditions applied → **APPROVED / FROZEN / CLOSED** |

- [x] APPROVE WITH CONDITIONS  
- [x] **CLOSED**  
- [ ] REJECT  

**Debt:** TD-EVT-1 Central Event Registry (P2)
