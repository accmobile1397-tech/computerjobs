# RFC-004 — Notification Architecture

**Status:** ✅ **APPROVED / FROZEN / CLOSED** (CTO APPROVE 2026-07-20)  
**ID:** RFC-004 · **Decision:** D-048  
**Audience:** ComputerJobs.ir unified messaging layer  
**Depends on:** RFC-003 (domain events as triggers) · RFC-001 (PII / contact unlock) · BullMQ  
**Blocks:** Phase 9 (Notification System)

---

## 1. Purpose

Define a single **Notification Gateway** used by all features — same pattern as AI Gateway (RFC-002) and PaymentProvider (Phase 7B).

**Deliverables (architecture only):**

- Module layout + provider abstraction  
- Template registry (data-driven)  
- Delivery pipeline + status model  
- User/company preferences  
- Idempotency + retry  
- Channel strategy (Phase 9 vs future)  

**Non-goal:** Marketing campaigns, WhatsApp/Telegram adapters, full mobile push infrastructure in Phase 9.

---

## 2. Principles

1. **Features never send notifications directly** — subscribe via events or call `notificationGateway.dispatch()` only from notification module / registered handlers.
2. **Provider-agnostic** — no Twilio/Kavenegar/Resend SDK outside `notifications/providers/`.
3. **Templates are data** — subject/body patterns in DB or versioned files; variables validated by schema.
4. **Preferences first** — respect user opt-in/opt-out per channel and category before send.
5. **Idempotent delivery** — `(eventId, channel, recipientId, templateKey)` dedupe.
6. **Fail soft** — notification failure must not roll back business transaction (already committed + event published).
7. **PII at render time** — templates receive ids; gateway resolves email/mobile/in-app target from DB at send time.
8. **Data-driven limits** — rate caps from `SystemSetting`; no hardcoded send quotas in TS.

---

## 3. HARD RULE — Provider-Agnostic Gateway

**Forbidden** in jobs / resumes / billing / auth / any non-notification code:

- SMS vendor SDKs (Kavenegar, Melipayamak, Twilio, …)  
- Email SDKs (Resend, SendGrid, SMTP clients, …)  
- FCM/APNs SDKs directly  
- WhatsApp / Telegram bots  

**Only** `src/modules/notifications/gateway` invokes `src/modules/notifications/providers/*`.

Violations = architecture breach; blocked in review.

---

## 4. Module layout (frozen)

```text
src/modules/notifications/
  gateway/              # dispatch(), renderTemplate(), resolveRecipients()
  providers/
    stub/               # log-only — CI/dev
    email/              # Phase 9 (HTTP or SMTP adapter)
    sms/                # Phase 9
    push/               # Phase 9 (stub → real)
    inapp/              # Phase 9 — DB inbox
  templates/            # registry loader + DB sync
  preferences/          # user/company channel prefs
  handlers/             # RFC-003 event → dispatch mappers
  types/
  jobs/                 # retry · digest · outbox drain
```

---

## 5. Channels

Enum (frozen): `EMAIL` · `SMS` · `IN_APP` · `PUSH` · `WEBHOOK` · (`WHATSAPP` · `TELEGRAM` future)

| Channel | Phase 9 | Provider slot | Notes |
|---------|---------|---------------|--------|
| **Email** | Required | `email` | Transactional only |
| **SMS** | Required | `sms` | OTP + transactional; no marketing |
| **In-App** | Required | `inapp` | `Notification` table inbox |
| **Push** | Required (stub OK) | `push` | Mobile/web push — stub until keys |
| **Webhook** | Reserved | `webhook` | **TD-NOTIF-1** — no Phase 9 impl; enum reserved for Zapier · n8n · Make · ERP · CRM |
| WhatsApp | Future RFC | — | Out of Phase 9 |
| Telegram | Future RFC | — | Out of Phase 9 |

Active provider per channel: `SystemSetting` keys:

- `notifications.activeEmailProvider` (seed: `stub`)  
- `notifications.activeSmsProvider` (seed: `stub`)  
- `notifications.activePushProvider` (seed: `stub`)  

---

## 6. Gateway contract

```text
DispatchRequest {
  templateKey: string           // e.g. job.application.received
  templateVersion?: number      // default latest active
  channel: EMAIL | SMS | IN_APP | PUSH | WEBHOOK
  recipientType: USER | COMPANY | EMAIL | PHONE
  recipientId: string           // userId / companyId / raw only in stub
  locale?: string               // default fa-IR
  variables: Record<string, string | number>  // no PII — ids/slugs/titles
  eventId?: string              // RFC-003 idempotency
  correlationId?: string
  priority?: normal | high
}

DispatchResult {
  ok: boolean
  notificationId: string
  provider: string
  channel: string
  status: PENDING | SENT | DELIVERED | FAILED | SKIPPED
  skipReason?: OPT_OUT | RATE_LIMIT | INVALID_RECIPIENT | TEMPLATE_DISABLED
}
```

### Pipeline (frozen order)

```text
1. idempotency check (eventId + channel + recipient + templateKey)
2. loadTemplate(templateKey, version, locale)
3. loadPreferences(recipient) → skip if opted out
4. rateLimit(channel, recipient)
5. resolveRecipientContact(recipientId) — email/phone/device token
6. renderTemplate(template, variables + resolved contact context)
7. provider.send(rendered)
8. persist NotificationDelivery row + status
9. on failure: schedule retry job (exponential backoff)
```

---

## 7. Template registry

Templates **must not** be inline strings in feature services.

**Allowed:**

```text
DB: notification_templates (key, version, channel, subject, body, variablesSchema, isActive)
Seed files: src/modules/notifications/templates/*.v1.json (imported on seed)
```

Example keys (Phase 9 starter set):

| templateKey | Channel | Trigger event |
|-------------|---------|---------------|
| `auth.email.verify` | EMAIL | `user.registered` |
| `auth.password.reset` | EMAIL | (auth flow) |
| `job.application.received` | EMAIL, IN_APP | `job.application.submitted` |
| `job.published.confirmation` | IN_APP | `job.published` |
| `payment.succeeded.receipt` | EMAIL | `payment.succeeded` |
| `subscription.activated` | EMAIL, IN_APP | `subscription.activated` |
| `contact.unlocked.confirmation` | IN_APP | `contact.unlocked` |
| `ai.credit.low` | IN_APP | (billing threshold — Phase 9 optional) |

Variables declared in JSON Schema per template; gateway rejects unknown keys.

---

## 8. Preferences

Model (Phase 9 impl):

```text
NotificationPreference {
  ownerType: USER | COMPANY
  ownerId: string
  category: transactional | billing | job_alerts | marketing  // marketing off by default
  channel: EMAIL | SMS | IN_APP | PUSH | WEBHOOK
  enabled: boolean
}
```

Rules:

- **Transactional** (payment, security, application status): cannot fully disable EMAIL/SMS if required for account security — only marketing categories fully opt-out.  
- Defaults: all transactional **on**; marketing **off**.  
- Preferences stored data-driven; admin can set system defaults via `SystemSetting`.

---

## 9. Delivery status & retry

| Status | Meaning |
|--------|---------|
| `PENDING` | Queued / not yet sent |
| `SENT` | Provider accepted |
| `DELIVERED` | Provider confirmed delivery (if supported) |
| `FAILED` | Permanent or exhausted retries |
| `SKIPPED` | Opt-out / rate limit / missing contact |

Retry (SystemSetting):

- `notifications.retry.maxAttempts` (seed: `5`)  
- `notifications.retry.backoffMs` (seed: `60000`)  
- Dead-letter: `NotificationDelivery` row + audit `NOTIFICATION_FAILED` (Phase 9 enum extension)

---

## 10. Event → notification mapping

Handlers in `notifications/handlers/` subscribe via RFC-003 EventBus.

Example:

```text
on event job.application.submitted:
  → dispatch EMAIL job.application.received to employer members
  → dispatch IN_APP job.application.received to employer owner
```

Mapping table (data-driven, Phase 9):

`SystemSetting` `notifications.eventMap` JSON or DB table `NotificationEventRule`:

```json
{
  "job.application.submitted": [
    { "templateKey": "job.application.received", "channel": "EMAIL", "recipient": "job.company.members" },
    { "templateKey": "job.application.received", "channel": "IN_APP", "recipient": "job.company.owner" }
  ]
}
```

**No hardcoded maps in jobs.service.ts.**

---

## 11. Integration with existing auth email

Phase 1 auth email stubs migrate to notification gateway:

- `auth.email.verify` · `auth.password.reset`  
- Auth module calls `notificationGateway.dispatch()` **or** publishes event consumed by notification handler — **not** both patterns long-term (pick one in Phase 9 spec; default: event-driven).

---

## 12. Permissions (Phase 9 API)

| Slug | Role |
|------|------|
| `notifications:read:own` | User inbox |
| `notifications:preferences:own` | Edit own prefs |
| `notifications:admin` | Templates · provider settings · replay |

Seed into IAM on Phase 9 migration.

---

## 13. Observability

Audit (Phase 9 extensions):

- `NOTIFICATION_DISPATCHED` · `NOTIFICATION_FAILED` · `NOTIFICATION_SKIPPED`  

Metrics (no body content): templateKey, channel, provider, latency, status.

---

## 14. Explicit non-goals

- Bulk marketing / newsletter engine  
- WhatsApp · Telegram (future RFC)  
- Employer-branded white-label email domains (future)  
- End-user template editing  
- Notification content moderation (use AI moderate only if product adds it later)  

---

## 15. Relation to phases

| Phase | Scope |
|-------|--------|
| **9** | Implement gateway + stub/email/sms/inapp + push stub + prefs + event handlers |
| **10** | Admin UI for templates, delivery viewer, replay |
| **13** | Notification funnel metrics |

**No Phase 9 coding until RFC-003 AND RFC-004 FROZEN** (done). Phase 9 TECHNICAL_SPEC next.

---

## 16. Technical debt linkage

- **TD-NOTIF-1:** Webhook channel provider (Zapier · n8n · Make · ERP · CRM) — P2  
- TD-P2-1: HTTP integration tests should cover notification dispatch idempotency  
- TD-P7A-3: overlaps TD-ADMIN-1 — use SystemSetting `feature.*` until flag engine lands

---

## CTO Decision Log

| Date | Decision |
|------|----------|
| 2026-07-20 | **APPROVE** → **APPROVED / FROZEN / CLOSED** |

- [x] APPROVE  
- [x] **CLOSED**  
- [ ] REJECT  

**Debt:** TD-NOTIF-1 Webhook channel (P2)
