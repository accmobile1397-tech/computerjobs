# Phase 13 — CTO Handoff Package (Analytics & Events)

**Prepared:** 2026-07-22 · **After:** Phase 12 tag `v0.13-phase-12` (D-076)  
**Status:** Spec preparation only — **implementation NOT authorized** · **no code · no migrations**

**Goal:** Enable CTO review and Phase 13 **specification planning** only.

---

## 1. Repository audit (current)

| Item | Value |
|------|-------|
| Branch | `main` |
| Phase 12 tag | ✅ `v0.13-phase-12` |
| Phase 11 tag | ✅ `v0.12-phase-11` |
| Live public SSR | Option 1 inventory (static · jobs · companies) |
| Event foundation | RFC-003 EventBus + DomainEventLog (Phase 9/10) |

### What exists to consume (do not rebuild)

| Asset | Status |
|-------|--------|
| Event catalog v1 · `EVENTS.*` | ✅ Phase 9 |
| EventBus publish + DomainEventLog append | ✅ Phase 9/10 |
| Admin events APIs / viewer debt | 🟡 TD-P10-2 incomplete UI |
| Billing / payment / job application publishers | ✅ partial MVP set |
| Notifications Gateway (event consumers) | ✅ Phase 9 |

### What Phase 13 is expected to define (planning only)

| Concern | Notes |
|---------|--------|
| Product analytics / funnel metrics | Scope TBD in TECHNICAL_SPEC |
| Observability at scale | Logging · metrics · tracing boundaries |
| Event retention / query / export | vs DomainEventLog admin read |
| Privacy / PII in analytics | Must align with existing auth + RFC-001 |
| Relation to Recommendation (Phase 14) | Inputs only — no Phase 14 work |

---

## 2. Architecture boundary

| Concern | Already done | Phase 13 (proposed) |
|---------|--------------|---------------------|
| Domain event publish / catalog | Phase 9 RFC-003 | consume / extend carefully |
| Notification side-effects | Phase 9 | do not fork gateway |
| Admin event viewer | Phase 10 + TD-P10-2 | may close debt or stay separate |
| Public SSR / SEO | Phases 11–12 | **out of scope** |
| Recommendation engine | Phase 14 | **out of scope** |

**Hard rule:** No new SEO architecture · no Phase 12 reopen · no Phase 14 recommendation work in Phase 13.

---

## 3. Suggested planning outcomes (CTO decides)

1. Confirm Phase 13 title/scope: **Analytics & Events** (ROADMAP) vs narrower MVP  
2. Decide whether TD-P10-2 is in-scope or remains separate debt  
3. Draft `docs/phase-13/TECHNICAL_SPEC` only after CTO authorize-to-spec  
4. Conditions list (C-013-*) before any implementation authorize  

---

## 4. Explicit non-goals (this handoff)

- ❌ Code · Prisma migrations · new modules  
- ❌ Phase 13 TECHNICAL_SPEC without CTO authorize-to-spec  
- ❌ SearchAction · taxonomy hubs · AI landings  
- ❌ Recommendation Engine (Phase 14)  
- ❌ Advanced AI Layer (Phase 15)  

---

## 5. Recommended next action

| Step | Owner |
|------|--------|
| Review this handoff | CTO |
| Authorize Phase 13 **spec drafting** (or refine scope) | CTO |
| TECHNICAL_SPEC → APPROVE → IMPLEMENTATION_PLAN | later |
| Implementation | **not authorized** |

**Stop:** Spec planning / handoff docs only until CTO issues an explicit Phase 13 authorize decision.
