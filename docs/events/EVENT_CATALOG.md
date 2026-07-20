# Domain Event Catalog (v1)

**Code source of truth:** `src/modules/events/catalog/v1.ts`  
**Architecture:** [RFC-003-EVENT-ARCHITECTURE.md](../rfc/RFC-003-EVENT-ARCHITECTURE.md) §6  
**Status:** ✅ Implemented (P9-002)

Do not duplicate event names or payload fields elsewhere — import from `@/modules/events/catalog`.

---

## Phase 9 notification MVP

These six events are flagged `phase9NotificationMvp` in the catalog:

| Event | Publisher | Aggregate |
|-------|-----------|-----------|
| `job.application.submitted` | jobs | JobApplication |
| `payment.succeeded` | billing | Payment |
| `subscription.activated` | billing | Subscription |
| `contact.unlocked` | billing | ContactUnlock |
| `ai.request.completed` | ai | AiRequest |
| `ai.request.failed` | ai | AiRequest |

Derived constant: `PHASE9_MVP_EVENT_NAMES` in `catalog/v1.ts`.

---

## Full catalog v1

| Event name | Version | Publisher | When | Payload fields |
|------------|---------|-----------|------|----------------|
| `job.published` | 1 | jobs | Status → PUBLISHED | jobId, companyId, slug |
| `job.closed` | 1 | jobs | Status → CLOSED | jobId, companyId |
| `job.application.submitted` | 1 | jobs | Application created | jobId, applicationId, userId |
| `resume.created` | 1 | resumes | First ACTIVE resume | resumeId, userId |
| `resume.updated` | 1 | resumes | Material update | resumeId, userId |
| `resume.viewed` | 1 | billing | Employer view consumed | resumeId, viewerCompanyId |
| `contact.unlocked` | 1 | billing | ContactUnlock row | companyId, targetUserId, unlockId |
| `payment.succeeded` | 1 | billing | Webhook settle OK | paymentId, ownerType, ownerId, sku |
| `payment.failed` | 1 | billing | Verify/settle fail | paymentId, reasonCode |
| `subscription.activated` | 1 | billing | New/renewed ACTIVE | subscriptionId, planSlug, ownerType, ownerId |
| `subscription.canceled` | 1 | billing | Cancel | subscriptionId |
| `quota.exceeded` | 1 | billing | Gate blocked | featureKey, ownerType, ownerId |
| `ai.request.completed` | 1 | ai | Gateway success | featureKey, requestId, creditsCaptured |
| `ai.request.failed` | 1 | ai | Gateway fail | featureKey, requestId, errorCode |
| `company.verified` | 1 | companies | Verification → VERIFIED | companyId |
| `user.registered` | 1 | auth | Register complete | userId, primaryType |

---

## Usage

```typescript
import {
  EVENT_CATALOG_V1,
  PHASE9_MVP_EVENT_NAMES,
  getCatalogEntry,
} from "@/modules/events/catalog";

const entry = getCatalogEntry("payment.succeeded");
// entry.publisherModule === "billing"
```

Envelope validation (`validateEnvelope`) checks catalog name, version, aggregateType, and required payload keys.

**Reserved (TD-EVT-1):** Central Event Registry service — not Phase 9.
