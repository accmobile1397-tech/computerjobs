# AI CTO Status — ComputerJobs.ir

**Purpose:** Single source of truth for external CTO reviews.  
**Update:** After every completed phase or major milestone.  
**Last updated:** 2026-07-20 · Phase 9 in progress (12/15 tasks)

---

## 1. Project Summary

Persian-first job platform for technology professionals.  
**Stack:** Next.js · Prisma/MySQL · Redis · BullMQ · `src/modules/`.  
**Live:** Auth/RBAC · Companies · Jobs · Resumes · Search · Billing · Payments · AI Gateway · Notifications (inbox API).  
**Workflow:** RFC → Spec → CTO APPROVE → Implement → Review → Tag. Commits on `main`.

---

## 2. Current Phase

**Phase 9 — Notification System** · 🟡 12/15 tasks · [TASKS.md](./phase-9/TASKS.md)

---

## 3. Last Approved Phase

**Phase 8** · ✅ CLOSED · `v0.9-phase-8`

---

## 4. Current Branch

`main` · ahead of `origin/main`

---

## 5. Recent Commits (last 5)

| Commit | Message |
|--------|---------|
| `6fce48c` | feat(notifications): add user inbox and preferences API (P9-012) |
| `6f07d4d` | feat(notifications): add event handlers via gateway only (P9-011) |
| `f830787` | feat(notifications): add InApp provider and inbox model (P9-010) |
| `16810cb` | feat(notifications): add stub SMS provider (P9-009) |
| `470813f` | feat(notifications): add stub email provider (P9-008) |

---

## 6. Completed Milestones

| Milestone | Status |
|-----------|--------|
| P9-001..P9-011 | ✅ APPROVED |
| P9-012 User API | ⏳ Awaiting review |

**Deferred:** Phase 6 closeout · BullMQ EventBus → Phase 13.

---

## 7. In Progress Tasks

None — **awaiting CTO review of P9-012** before P9-013.

---

## 8. Pending Tasks (Phase 9)

P9-013 Admin API · P9-014 Permissions · P9-015 Tests

---

## 9. Open Risks

- Phase 6 not tagged (deferred).
- TD-P2-1 no HTTP integration tests.
- Permission slugs `notifications:read:own` / `notifications:preferences:own` not seeded yet (P9-014) — API uses auth + owner boundaries only.

---

## 10. Architecture Decisions (active)

C-009-1..5 · Inbox SoT = `notifications` · Preferences via `preference.service` · Handlers → Gateway only.

---

## 11. Known Technical Debt

**P1:** TD-P2-1 · TD-P5-1 · TD-P6-2 · TD-P7A-4 · TD-P7B-1 · TD-P7B-2  
**P2:** TD-P6-1 · TD-P8-1 · TD-P7A-1/2/3 · TD-P7B-3 · TD-EVT-1 · TD-NOTIF-1 · TD-NOTIF-2 · TD-ADMIN-1

---

## 12. Questions For CTO

1. **P9-012** — approve to proceed with **P9-013 Admin API**?

---

## 13. Recommended Next Actions

1. Review user notification API routes.
2. If approved → **P9-013 Admin API**.

**Health:** 107/107 tests · typecheck green · prisma validate green.
