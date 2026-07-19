# RFC-001 — Monetization

**Status:** ⏳ Awaiting CTO Approval  
**ID:** RFC-001-B  
**Companion:** [RFC-001-PRODUCT-RULES.md](./RFC-001-PRODUCT-RULES.md)  
**Goal:** Freeze commercial model before Phase 7  
**Scope:** Pricing model, entitlements, billing mechanics, gateway assumptions — **no implementation**  
**Currency (MVP):** IRR (rial) display; amounts stored as integer **IRR** (no decimals)

---

## 1. Commercial Model Summary

Hybrid:

1. **Subscription** — recurring entitlements (quotas).
2. **Consumption packs** — prepaid unlocks / views / AI credits / featured days.
3. **À-la-carte** — single consumable purchase when packs inconvenient.

Free tiers always available (see Product Rules).

---

## 2. Proposed List Prices (IRR) — CTO to amend

> Placeholder list prices for planning. Final marketing prices may differ; **SKU IDs stable**.

### Seeker

| SKU | Period | Price IRR | Includes |
|-----|--------|-----------|----------|
| `seeker_pro_m` | 1 month | 490,000 | Seeker Pro quotas + 50 AI credits |
| `seeker_pro_y` | 12 months | 4,900,000 | Same monthly entitlements ×12 + 800 AI credits |

### Employer subscriptions (per company)

| SKU | Period | Price IRR | Maps to plan |
|-----|--------|-----------|--------------|
| `employer_starter_m` | 1 month | 2,900,000 | Starter |
| `employer_starter_y` | 12 months | 29,000,000 | Starter |
| `employer_growth_m` | 1 month | 7,900,000 | Growth |
| `employer_growth_y` | 12 months | 79,000,000 | Growth |
| `employer_enterprise` | custom | custom | Enterprise |

### Consumable packs

| SKU | Contents | Price IRR |
|-----|----------|-----------|
| `pack_unlock_10` | 10 contact unlocks | 990,000 |
| `pack_unlock_50` | 50 contact unlocks | 3,900,000 |
| `pack_view_50` | 50 resume views | 490,000 |
| `pack_view_200` | 200 resume views | 1,490,000 |
| `pack_ai_100` | 100 AI credits | 390,000 |
| `pack_ai_500` | 500 AI credits | 1,490,000 |
| `pack_featured_7` | 7 featured-days | 790,000 |

### À-la-carte

| SKU | Unit price IRR |
|-----|----------------|
| `unit_unlock` | 120,000 |
| `unit_view` | 15,000 |
| `unit_ai` | 5,000 |
| `unit_featured_day` | 150,000 |

---

## 3. Entitlement Engine (Phase 7 design target)

```text
Plan → EntitlementGrant (period quotas)
Pack/Purchase → WalletLedger (+balance)
Action → QuotaCheck → LedgerDebit | PlanQuotaConsume
AI → Reserve → Capture/Release
```

**Entities (conceptual — Phase 7 schema):**

| Entity | Purpose |
|--------|---------|
| `Plan` / `PlanPrice` | Catalog |
| `Subscription` | companyId or userId + plan + period |
| `Wallet` | balances per consumable type |
| `WalletLedger` | immutable credit/debit rows |
| `QuotaUsage` | period counters for plan limits |
| `AiCreditReservation` | open reserves |
| `Payment` / `PaymentAttempt` | gateway transactions |
| `Invoice` | fiscal snapshot (optional MVP) |

**No** MatchScore persistence. **No** SavedSearch billing until SavedSearch ships.

---

## 4. Subscription Lifecycle

| Event | Behavior |
|-------|----------|
| Subscribe | Payment success → Subscription ACTIVE → grant period quotas |
| Renew | Auto-charge if gateway token allows; else grace 3 days then FREE |
| Upgrade | Immediate; charge prorated difference; quotas become max(plan) |
| Downgrade | Effective next period; current quotas remain until end |
| Cancel | Access until period end → FREE |
| Payment fail | Retry policy gateway-dependent; notify; grace then FREE |

---

## 5. Consumption & AI Credits

### Wallet debit order

1. Plan included remaining quota (if action maps to plan quota).
2. Else wallet pack balance.
3. Else reject with upgrade/purchase URL.

### AI reserve (Phase 8 runtime; schema Phase 7 OK)

| State | Meaning |
|-------|---------|
| `RESERVED` | held, not spendable elsewhere |
| `CAPTURED` | final spend |
| `RELEASED` | returned to wallet |
| `EXPIRED` | auto-release after TTL (default 15 min) |

---

## 6. Invoicing & Tax (MVP assumptions)

- B2C seeker: simple payment receipt.
- B2B employer: company legal name + national ID (when collected) on invoice PDF later.
- VAT/عوارض: **TBD** — flag `taxMode=none` until finance confirms.
- Store gateway authority code / ref for dispute.

---

## 7. Future Payment Gateway Assumptions

**Phase 7 implements provider abstraction; concrete gateway selectable without rewriting product rules.**

| Assumption | Decision |
|------------|----------|
| Market | Iran-first (IRR) |
| Abstraction | `PaymentProvider` interface: createPayment, verify, webhook, refund |
| Primary candidate | Zarinpal **or** IDPay **or** NextPay — **CTO pick at Phase 7 start** |
| Fallback | Second Iranian PSP behind same interface |
| International | Deferred (Stripe/crypto) — not MVP |
| Webhooks | Idempotent by `gatewayRef`; signature verify |
| Refunds | Manual admin first; API refund Phase 7.1 |
| PCI | No card data on our servers — redirect/IPG only |
| Sandbox | Required before production keys |
| Settlement | Company wallet ≠ PSP settlement account |

**Open (must resolve before Phase 7 coding):**

- [ ] Primary PSP
- [ ] VAT handling
- [ ] Yearly discount confirmation
- [ ] Enterprise contracting offline vs in-app

---

## 8. Advertisement Monetization

| Product | Billing |
|---------|---------|
| Featured job | `featured_day` consumable |
| Urgent badge | included in higher plans or small consumable |
| Display network banners | separate Ad campaign budget (future RFC) |

Featured inventory capped per page (Product Rules §8).

---

## 9. Anti-Abuse (commercial)

- Velocity caps on unlock purchases + unlocks/hour.
- Chargebacks → freeze wallet + suspend company pending review.
- Enterprise custom pricing only via SUPER_ADMIN grant (no self-serve spoof).

---

## 10. Phase Mapping

| Phase | Monetization work |
|-------|-------------------|
| **7** | Plans, wallets, quotas, checkout, PSP adapter, unlock/view metering |
| **8** | AI credit reserve/capture wired to AI gateway |
| Later | Banner ads network, international PSP, multi-resume SKUs |

---

## 11. Explicit Non-Goals (this RFC)

- Implementing payment code
- Choosing final marketing copy
- Building fiscal full accounting ERP
- Crypto / USDT settlement

---

## CTO Checklist

- [ ] APPROVE prices & SKUs as-is
- [ ] APPROVE WITH CONDITIONS (edit §2 prices / PSP)
- [ ] REJECT

**After both RFC-001 docs APPROVE → generate `docs/phase-7/TECHNICAL_SPEC.fa.md` only.**  
**No Phase 7 coding until that spec is APPROVED.**

---

## References

- [RFC-001-PRODUCT-RULES.md](./RFC-001-PRODUCT-RULES.md)
- Legacy draft: [payments.md](./payments.md) (superseded by RFC-001 for Phase 7 planning)
- Roadmap D-028 · Phase 7 Payments & Plans
