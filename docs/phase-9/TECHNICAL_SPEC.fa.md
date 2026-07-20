# مشخصات فنی — Phase 9: Notification System

**پروژه:** ComputerJobs.ir  
**فاز:** 9  
**وضعیت:** ✅ **APPROVE WITH CONDITIONS** — C-009-1..4 اعمال شد (پیاده‌سازی هنوز شروع نشده)  

**Prerequisites (باید قبلاً فریز شده باشند):**
- RFC-003 Event Architecture (C-003-1/2) — ✅ CLOSED
- RFC-004 Notification Architecture — ✅ FROZEN / CLOSED
- RFC-005 Admin Platform Architecture — ✅ FROZEN / CLOSED
- RFC-001 Product Rules — invariants / داده‌محور
- RFC-002 AI Architecture — gateway-only الگو برای gateway notifications
- D-051 Architecture Freeze v1 (stack complete تا قبل از Phase 10)

---

## ۱. Scope

**هدف Phase 9:** پیاده‌سازی یک **Notification Gateway** و **Delivery System** کاملاً event-driven که:
1) توسط feature modules مستقل از provider اجرا شود،  
2) فقط از طریق Notification Gateway و handlersِ EventBus ارسال کند،  
3) برای کانال‌های **Email / SMS / In-App** کار کند،  
4) **Push** را به شکل stub نگه دارد.

### In
- ماژول notification با ساختار:
  - `modules/notifications/gateway/`
  - `modules/notifications/providers/` برای stub و adapterهای Phase 9
  - `modules/notifications/handlers/` برای map eventها به dispatch
- template registry و rendering (کاملاً registry-based و data-driven)
- preferences enforcement قبل از delivery
- delivery persistence + retry + idempotency
- integration با AuditLog و event-driven signals

### Out
- WhatsApp / Telegram (فقط enum/reserve)
- bulk/marketing campaigns
- ساخت Full Admin Dashboard (Phase 10)
- analytics warehouse (Phase 13)
- webhook channel (TD-NOTIF-1، فقط enum reserved)

---

## ۲. Architecture

### ۲.۱. معماری رویدادی (Event-driven — MUST)
- feature modules **هیچ‌وقت** خودشان provider SMS/Email را صدا نمی‌زنند.
- feature modules فقط **domain event** publish می‌کنند.
- Notification ها توسط subscriber handlers در `modules/notifications/handlers/` از روی **EventBus** ساخته می‌شوند.

#### HARD RULE (منطبق با RFC-004)
در هیچ مسیر feature code مجاز نیست:
- SMS vendor SDKها
- Email vendor SDKها
- FCM/APNs SDK مستقیم

فقط:
- `modules/notifications/gateway` مجاز است `modules/notifications/providers/*` را فراخوانی کند.

### ۲.۲. ماژول‌ها و مرزها

```text
feature modules
  (publish domain event)
        ↓
EventBus (RFC-003)
        ↓
notifications/handlers
  (event → DispatchRequest)
        ↓
notifications/gateway
  (idempotency → prefs → template → rate-limit → resolveRecipients → render → provider.send)
        ↓
notifications/providers
  (email/sms/inapp/push stub)
        ↓
DB persistence (delivery status)
        ↓
AuditLog (dispatch/failed/skipped)
```

### ۲.۳. Event mapping برای Phase 9 (حداقل مجموعه)
در Phase 9 باید حداقل mappingهای زیر پوشش داده شوند:
- `job.application.submitted`
- `payment.succeeded`
- `subscription.activated`
- `contact.unlocked`
- `ai.request.completed` (in-app یا email با توجه به ترجیح کانال — با policy data-driven)
- `ai.request.failed` (in-app یا email با توجه به ترجیح — fail-soft)

> نکته: اگر برخی کانال‌ها در SystemSetting خاموش باشند، delivery با `SKIPPED` یا `FAILED` طبق pipeline انجام می‌شود، نه اینکه تراکنش business rollback شود.

---

## ۳. Data Model

این بخش **صرفاً طراحی مدل‌های مورد نیاز Phase 9** است (بدون تولید Prisma/مهاجرت در این spec).

### ۳.۰. Enumerations (reserved)

#### NotificationPriority (reserved — no implementation in Phase 9)

Enum values:
- `LOW`
- `NORMAL`
- `HIGH`
- `CRITICAL`

Policy examples (documentation-only):
- `payment.failed` → `HIGH`
- `auth.password.reset` → `CRITICAL`
- `marketing` → `LOW`

Phase 9 فقط **مدل را رزرو می‌کند**؛ اولویت‌دهی واقعی در delivery engine در Phase 9 لازم نیست.

### ۳.۱. NotificationTemplate
ثبت قالب‌ها به شکل registry-based و versioned.

فیلدهای پیشنهادی:
- `id` (string/uuid)
- `templateKey` (string، یکتا در سطح کلید)
- `version` (int، یکتا در کلید)
- `channel` (EMAIL | SMS | IN_APP | PUSH | WEBHOOK (reserved))
- `locale` (اختیاری؛ seed fa-IR)
- `subject` (برای email)
- `body` (متن قالب / pattern؛ بدون PII)
- `variablesSchema` (JSON schema برای validate کردن keys)
- `isActive` (bool)
- `createdAt`, `updatedAt`

### ۳.۲. Notification (Inbox item)
برای In-App، یک مدل برای inbox item لازم است.

فیلدهای پیشنهادی:
- `id`
- `ownerType` (USER | COMPANY)
- `ownerId`
- `templateKey`
- `templateVersion`
- `title` (اختیاری، derivable)
- `content` (در صورت نیاز render شده؛ یا ارجاع به render payload)
- `eventId` (RFC-003 envelope id برای idempotency)
- `correlationId` (MUST — همان envelope correlationId برای trace)
- `status` (PENDING/SENT/DELIVERED/FAILED/SKIPPED)
- timestamps

### ۳.۳. NotificationDelivery (منبع وضعیت کانال/ارسال)
برای هر dispatch یک delivery record نگهداری می‌شود.

فیلدهای پیشنهادی:
- `id`
- `eventId` (idempotency key)
- `correlationId` (RFC-003 envelope correlation id — MUST؛ برای end-to-end trace)
- `channel`
- `recipientType` (USER | COMPANY | EMAIL | PHONE (در stub))
- `recipientId` (id یا raw-only در stub)
- `priority` (NotificationPriority — reserved; no Phase 9 implementation required)
- `templateKey`
- `templateVersion`
- `provider` (string)
- `status` (PENDING | SENT | DELIVERED | FAILED | SKIPPED)
- `skipReason` (OPT_OUT | RATE_LIMIT | INVALID_RECIPIENT | TEMPLATE_DISABLED | OTHER)
- `attemptCount`
- `lastErrorCode`, `lastErrorMessage` (mask‌شده؛ بدون PII)
- `createdAt`, `updatedAt`

### ۳.۴. NotificationPreference
اجبار preferences قبل از delivery.

فیلدهای پیشنهادی:
- `id`
- `ownerType` (USER | COMPANY)
- `ownerId`
- `channel` (EMAIL | SMS | IN_APP | PUSH)
- `category` (transactional | billing | job_alerts | marketing)
- `enabled` (bool)
- `createdAt`, `updatedAt`

Policy:
- **transactional پیش‌فرض ON** (fail-safe برای امنیت و پیام‌های حیاتی)
- marketing پیش‌فرض OFF

### ۳.۵. C-009-1 — CorrelationId end-to-end (MUST)

`correlationId` از **RFC-003 DomainEvent envelope** به تمام لایه‌ها propagate می‌شود:

```text
payment.succeeded (correlationId = X)
     ↓
NotificationDelivery (correlationId = X)
     ↓
AuditLog metadata (correlationId = X)
```

قوانین:
- اگر event دارای `correlationId` باشد، gateway **باید** آن را روی `NotificationDelivery` و audit metadata بنویسد.
- اگر event فاقد `correlationId` باشد، gateway از `eventId` به عنوان fallback استفاده می‌کند (فقط برای trace داخلی).
- Admin delivery viewer باید فیلتر `correlationId` را پشتیبانی کند.

---

## ۴. Event Mapping

### ۴.۱. Event-name ورودی (طبق RFC-003 catalog)
handlerها فقط روی نام‌های زیر active می‌شوند (v1):
- `job.application.submitted`
- `payment.succeeded`
- `subscription.activated`
- `contact.unlocked`
- `ai.request.completed`
- `ai.request.failed`

### ۴.۲. Map به TemplateKey و Channel
mappingها باید **data-driven** باشند (در Phase 9 پیاده‌سازی admin-configurable از طریق DB یا SystemSetting؛ بدون hardcode در featureها).

شکل mapping پیشنهادی:

```json
{
  "version": 1,
  "mappings": {
    "job.application.submitted": [
      { "templateKey": "job.application.received", "channels": ["EMAIL","IN_APP"], "recipients": ["job.company.members","job.company.owner"] }
    ],
    "payment.succeeded": [
      { "templateKey": "payment.succeeded.receipt", "channels": ["EMAIL"], "recipients": ["payment.owner"] }
    ]
  }
}
```

### ۴.۳. Rules برای resolveRecipients
resolveRecipients باید **در gateway یا handler** ولی طبق قرارداد registry/envelope عمل کند، نه feature code:
- `job.application.submitted`:
  - recipientهای احتمالی:
    - اعضای شرکت کارفرما (job.companyId)
    - مالک/owner شرکت (اگر مدل عضو‌-مالک جدا است)
- `payment.succeeded`:
  - recipient: owner/payment.ownerId
- `subscription.activated`:
  - recipient: ownerType+ownerId از subscription
- `contact.unlocked`:
  - recipient: target user (در inbox) + تایید sender در صورت policy
- `ai.request.completed/failed`:
  - recipient: صاحب credits یا ownerType=USER/COMPANY مطابق envelope

---

## ۵. Delivery Pipeline (فریز — مطابق RFC-004)

pipeline باید دقیقاً این ترتیب را رعایت کند:

```text
1) idempotency check (eventId + channel + recipientId + templateKey)
2) loadTemplate(templateKey, version, locale)
3) loadPreferences(recipient) → skip if opted-out
4) rateLimit(channel, recipient)
5) resolveRecipientContact(recipientId)  (email/phone/device token)
6) renderTemplate(template, variables + resolved contact context)
7) provider.send(rendered)  (via providers/* only)
8) persist NotificationDelivery + Notification (for in-app)
9) on failure: schedule retry job (exponential backoff)
```

### ۵.۱. Channel Capability Matrix (reserved for Phase 9 admin and future routing)

این ماتریس فقط رزرو است (برای تصمیم‌های UI/Policy و آماده‌سازی پیاده‌سازی قابلیت‌ها در آینده). اجرای واقعی در delivery engine در Phase 9 لازم نیست.

```text
EMAIL
  retry=yes
  rich-template=yes

SMS
  retry=yes
  subject=no

IN_APP
  retry=no

PUSH
  reserved
```

### Idempotency
دُدِیوپلی باید حداقل TTL برابر 24h داشته باشد.
کلید:
`(eventId, channel, recipientId, templateKey, templateVersion)`

### Retry Strategy
- `maxAttempts` و `backoffMs` از SystemSetting/Config
- در نهایت `FAILED` یا `SKIPPED` با `audit` و ثبت reason

### Fail-soft
اگر delivery fail شد:
- business transaction rollback نمی‌شود.
- audit + NotificationDelivery status ثبت می‌شود.

---

## ۶. Permissions (Phase 9)

### ۶.۱. API سطح دسترسی
در Phase 9 حداقل این role slugs لازم است (seed/مهاجرت در Phase 9 impl):
- `notifications:read:own` (inbox مشاهده)
- `notifications:preferences:own` (ویرایش prefs)
- `notifications:admin` (template/provider/settings/replay)

> اگر در Phase 9 هنوز Admin UI وجود ندارد، این permission برای admin APIها کافی است.

---

## ۷. Audit Events

AuditLog همچنان برای compliance و forensic باقی می‌ماند.

در Phase 9 implementation لازم است eventهای زیر در AuditAction اضافه/معتبر شوند (این spec shape را تعریف می‌کند):
- `NOTIFICATION_DISPATCHED`
- `NOTIFICATION_DELIVERED` (در صورت provider confirm)
- `NOTIFICATION_SKIPPED`
- `NOTIFICATION_FAILED`

metadata پیشنهادی (بدون PII):
- `eventId`, `eventName`
- `correlationId` (C-009-1 — MUST when present on source event)
- `templateKey`, `templateVersion`
- `channel`, `provider`, `recipientId` (id نه email/phone خام)
- `skipReason` یا `errorCode`
- `attemptCount`

---

## ۸. Admin Requirements

Phase 10 برای UI است؛ اما Phase 9 باید admin API برای کنترل معماری ارسال notification را آماده کند.

حداقل contractها:

### ۸.۱ Template Admin
- CRUD template metadata (کلید، ورژن، فعال/غیرفعال، schema variables)
- تغییرات باید audit شود.

### ۸.۲ Provider/Admin Settings
- فعال/غیرفعال provider برای هر channel (stub/mail/sms/inapp/push)
- rate-limit thresholds و retry policy

### ۸.۳ Event Mapping Admin
- مدیریت mapping eventName → templateKey/channel/recipient rules
- بدون hardcode در feature modules

### ۸.۴ Delivery Viewer / Replay
- مشاهده `NotificationDelivery` با فیلترهای eventId/eventName/template/channel
- replay (با idempotency محفوظ) برای تست یا اصلاح؛ اما webhook channel در Phase 9 ندارد

---

## ۹. Technical Debt

### Carryover / Visible
- **TD-P2-1:** HTTP integration tests (به‌خصوص idempotency و retry در notification delivery)
- **TD-NOTIF-1:** Webhook Channel — فعلاً فقط enum/reserve، provider و implementation بعداً (Zapier/n8n/Make/ERP/CRM)
- **TD-NOTIF-2:** Notification Digest Engine — Daily/Weekly batching (Job Alerts / Saved Searches / Weekly Reports)؛ فعلاً پیاده‌سازی نشود
- **TD-EVT-1:** Central Event Registry service — رزرو شده؛ Phase 9 از catalog/v1 file استفاده می‌کند
- **TD-ADMIN-1:** Feature Flag Engine — رزرو شده، تا زمان ورود flag engine از `SystemSetting` برای gating استفاده می‌شود

---

## ۱۰. Acceptance Gate

1. ~~CTO APPROVE این TECHNICAL_SPEC~~ ✅ C-009-1..4 اعمال شد
2. (پیش‌نیازها) RFC-003 / RFC-004 / RFC-005 باید CLOSED/FROZEN باشند (آنها انجام شده)
3. سپس implementation در `main` آغاز می‌شود (diff-only) با رعایت HARD RULEهای RFC-003/004:
   - feature modules فقط event publish
   - gateway-only برای providers
   - templates registry-based و data-driven
   - preferences enforcement قبل از delivery
   - `correlationId` end-to-end (C-009-1)
   - mapping versioning `{ version, mappings }` (C-009-4)

**Implementation may start (spec approved with C-009-1..4; diff-only; no migrations/code in this spec).**

**Plan:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

