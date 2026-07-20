# ComputerJobs.ir — Project Status & Roadmap (After Phase 8)

**Status:** Source of truth until **Version 1.0** · **Decision:** D-046  
**Flow:** RFC → Spec → CTO APPROVE → Implement → Test → CTO Review → Tag → Close

---

## Current Position

The project is no longer in the foundation stage. The platform is **technically usable**.

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

**Capabilities live today:** Auth · RBAC · Companies · Jobs · Resumes · Search · Matching · Billing · Payments · AI Gateway.

**Deferred slice:** Phase **8.1** Resume AI Suggest (from P8-2).

---

## Architecture Status

The biggest future risk is **cross-module architecture**, not greenfield coding:

- Events  
- Notifications  
- Admin Platform  
- Analytics  
- Observability  

These must be **frozen via RFC** before major feature expansion.

---

## Required Before Phase 9

Create and approve (in order):

| RFC | Topic | Doc |
|-----|--------|-----|
| RFC-003 | Event Architecture | [RFC-003-EVENT-ARCHITECTURE.md](./rfc/RFC-003-EVENT-ARCHITECTURE.md) · [EVENT_CATALOG](./events/EVENT_CATALOG.md) |
| RFC-004 | Notification Architecture | [RFC-004-NOTIFICATION-ARCHITECTURE.md](./rfc/RFC-004-NOTIFICATION-ARCHITECTURE.md) |
| RFC-005 | Admin Platform Architecture | [RFC-005-ADMIN-PLATFORM-ARCHITECTURE.md](./rfc/RFC-005-ADMIN-PLATFORM-ARCHITECTURE.md) |

**No Phase 9+ implementation until RFC-003, RFC-004, RFC-005 are APPROVED/FROZEN.**

---

## Product Roadmap (Phases 9–15)

After RFC-003/004/005 approval:

| Phase | Scope |
|-------|--------|
| **9** | Notification System — SMS · Email · In-App · Templates · Preferences |
| **10** | Admin Platform — Dashboard · Moderation · Billing/AI/Notification mgmt · Audit viewer |
| **11** | SEO Platform — SSR strategy · sitemap · structured data · programmatic SEO foundation |
| **12** | Public Website & SSR — Public job/company/resume pages |
| **13** | Analytics & Reporting — Employer/seeker analytics · funnels · revenue |
| **14** | Recommendation System — Job/candidate recs · personalized feeds (Phase 6 + 8) |
| **15** | Advanced AI — Resume/JD optimization · AI recruiter/career assistant (RFC-002) |

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
| TD-P6-1 | Advanced Search Engine |
| TD-P8-1 | Local Ollama Provider |
| TD-P7A-1 | Entitlement Cache Layer |
| TD-P7A-2 | Usage Analytics |
| TD-P7A-3 | Feature Flag Framework |
| TD-P7B-3 | Multi PSP Failover |

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
