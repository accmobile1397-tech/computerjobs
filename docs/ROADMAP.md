# ComputerJobs.ir — Project Status & Roadmap

**Status:** Source of truth until **Version 1.0** · **Decision:** D-046  
**Flow:** RFC → Spec → CTO APPROVE → Implement → Test → CTO Review → Tag → Close

---

## Current Position

The platform is **technically usable** with notifications MVP live.

### Completed foundations

| Phase | Scope | Tag |
|-------|--------|-----|
| 0 | Foundation | — |
| 1 | IAM & RBAC | `v0.2-phase-1` |
| 2 | Profiles & Companies | `v0.3-phase-2` |
| 3 | Location & Taxonomy | `v0.4-phase-3` |
| 4 | Jobs Core | `v0.5-phase-4` |
| 5 | Resume Builder | `v0.6-phase-5` |
| 6 | Search & Matching | implemented · **formal close/tag pending** |
| 7A | Entitlements, Plans, Quotas, Wallet | `v0.7-phase-7A` |
| 7B | Payments | `v0.8-phase-7B` |
| 8 | AI Gateway & Initial AI Features | `v0.9-phase-8` |
| 9 | Notification System | `v0.10-phase-9` |
| 10 | Admin Platform | ✅ `v0.11-phase-10` |

**Capabilities live today:** Auth · RBAC · Companies · Jobs · Resumes · Search · Matching · Billing · Payments · AI Gateway · Notifications · **Admin Platform**.

**Phase 9:** ✅ **FULLY CLOSED** · tag `v0.10-phase-9` · [PHASE_9_CLOSURE_REPORT.md](./phase-9/PHASE_9_CLOSURE_REPORT.md)

**Phase 10:** ✅ **CLOSED** (D-055 · C-P10-1 → TD-P10-2) · tag ✅ `v0.11-phase-10` · [PHASE_10_CLOSURE_REPORT.md](./phase-10/PHASE_10_CLOSURE_REPORT.md)

**Phase 11:** ✅ **D-056 APPROVE WITH CONDITIONS** · RFC-006 FROZEN · [IMPLEMENTATION_PLAN](./phase-11/IMPLEMENTATION_PLAN.md) · [TASKS](./phase-11/TASKS.md) · **code not started**

---

## Architecture Status

**Core cross-module RFCs:** RFC-003 Events · RFC-004 Notifications · RFC-005 Admin — ✅ **CLOSED / FROZEN** (2026-07-20).

CTO: through Phase 10, **no new RFC required** for main platform capabilities. Stack: IAM · Companies · Jobs · Resume · Search · Billing · Payments · AI · Events · Notifications · Admin.

Remaining risks (Phase 13+): Analytics · Observability at scale.

---

## Required Before Phase 9 (done)

| RFC | Topic | Status |
|-----|--------|--------|
| RFC-003 | Event Architecture | ✅ CLOSED (D-047) |
| RFC-004 | Notification Architecture | ✅ CLOSED (D-048) |
| RFC-005 | Admin Platform Architecture | ✅ CLOSED (D-049) |

**Phase 10:** ✅ CLOSED (D-055).

---

## Product Roadmap (Phases 9–15)

CTO-approved order:

| Phase | Scope |
|-------|--------|
| **9** | Notification System — ✅ **CLOSED** (`v0.10-phase-9`) |
| **10** | Admin Platform — ✅ **CLOSED** (`v0.11-phase-10`) |
| **11** | SEO Foundation — ✅ D-056 AWC · plan ready · **await start P11-001** |
| **12** | SSR Public Pages |
| **13** | Analytics & Events |
| **14** | Recommendation Engine |
| **15** | Advanced AI Layer |

---

## Technical Debt (visible — update on every phase close)

### P1

| ID | Item |
|----|------|
| TD-P2-1 | HTTP integration tests |
| TD-P5-1 | Application Resume Snapshot |
| TD-P6-2 | Search Rate Limiting |
| TD-P7A-4 | AI Credit Reservation Stress Testing |
| TD-P7B-1 | Payment Reconciliation Job |
| TD-P7B-2 | Webhook Replay Protection |

### P2

| ID | Item |
|----|------|
| **TD-P10-2** | **Admin Events Viewer UI completion** (C-P10-1) |
| TD-P10-1 | Full admin route consolidation |
| TD-P6-1 | Advanced Search Engine |
| TD-P8-1 | Local Ollama Provider |
| TD-P7A-1 | Entitlement Cache Layer |
| TD-P7A-2 | Usage Analytics |
| TD-P7A-3 | Feature Flag Framework |
| TD-P7B-3 | Multi PSP Failover |
| TD-EVT-1 | Central Event Registry |
| TD-NOTIF-1 | Webhook notification channel |
| TD-ADMIN-1 | Feature Flag Engine |
| TD-NOTIF-2 | Notification Digest Engine |

---

## Product Invariants (non-negotiable)

- One resume per user  
- No resume file uploads  
- Contact hidden until unlock  
- Verified company requirements  
- MatchScore not persisted  
- AI through gateway only  

See [RFC-001-PRODUCT-RULES.md](./rfc/RFC-001-PRODUCT-RULES.md).

---

## CTO Development Rules

- **SPEC-FIRST** — never implement before CTO approval  
- **Data-driven** — no hardcoded business limits  
- **Diff-only** — load current phase + relevant RFC only  
- **Debt** — no phase closes without debt status update  
