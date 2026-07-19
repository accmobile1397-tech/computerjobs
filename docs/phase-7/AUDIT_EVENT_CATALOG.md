# Billing Audit Event Catalog — Phase 7A+

**Module:** `billing` · **Source:** `AuditAction` enum in Prisma

| Event | When | Typical metadata |
|-------|------|------------------|
| `PLAN_CREATED` | Admin creates PlanDefinition | planId, slug |
| `PLAN_UPDATED` | Admin updates plan metadata | planId |
| `PLAN_FEATURE_VERSIONED` | New PlanFeature version row | planFeatureId, featureKey, version |
| `PLAN_PRICE_UPDATED` | PlanPrice amount/currency/SKU change | sku, amount, currency |
| `SUBSCRIPTION_CREATED` | Subscription provisioned | subscriptionId, planId, ownerType, ownerId |
| `SUBSCRIPTION_CHANGED` | Plan change on subscription | fromPlanId, toPlanId |
| `SUBSCRIPTION_CANCELED` | Cancel at period end / immediate | subscriptionId |
| `SUBSCRIPTION_HISTORY_RECORDED` | History row appended | event, subscriptionId |
| `WALLET_CREDITED` | ConsumableBalance +CREDIT | consumableType, amount, txId |
| `WALLET_DEBITED` | ConsumableBalance DEBIT | consumableType, amount, txId |
| `AI_CREDIT_RESERVED` | Reserve AI credits | amount, requestId |
| `AI_CREDIT_CAPTURED` | Capture reserved | amount, requestId |
| `AI_CREDIT_RELEASED` | Release reserved | amount, requestId |
| `QUOTA_CONSUMED` | Period QuotaUsage increment | featureKey, periodKey, amount, source |
| `CONTACT_UNLOCKED` | ContactUnlock created | companyId, targetUserId, unlockId |
| `SYSTEM_SETTING_UPDATED` | SystemSetting write | key |
| `BILLING_ADMIN_GRANT` | Admin wallet credit | consumableType, amount, ownerId |

## Phase 7B (planned — not implemented)

| Event | When |
|-------|------|
| `PAYMENT_CREATED` | Checkout started |
| `PAYMENT_SUCCEEDED` | IPG verify / webhook success |
| `PAYMENT_FAILED` | Failed attempt |
| `PAYMENT_REFUNDED` | Refund |

## ContactUnlock uniqueness

Verified in schema: `@@unique([companyId, targetUserId])`  
(`targetUserId` = candidate user — product “companyId + candidateUserId”)
