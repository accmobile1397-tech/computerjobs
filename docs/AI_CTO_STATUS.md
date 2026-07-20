# AI CTO Status — ComputerJobs.ir

**Purpose:** Single source of truth for external CTO reviews.  
**Update:** After every completed phase or major milestone.  
**Last updated:** 2026-07-20 · Phase 9 in progress (14/15 tasks)

---

## 1. Project Summary

Persian-first job platform for technology professionals.  
**Stack:** Next.js · Prisma/MySQL · Redis · BullMQ · `src/modules/`.  
**Live:** Auth/RBAC · Companies · Jobs · Resumes · Search · Billing · Payments · AI Gateway · Notifications (user + admin APIs + IAM).  
**Workflow:** RFC → Spec → CTO APPROVE → Implement → Review → Tag. Commits on `main`.

---

## 2. Current Phase

**Phase 9 — Notification System** · 🟡 14/15 tasks · [TASKS.md](./phase-9/TASKS.md)

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
| `dec5cd7` | feat(iam): seed notification permissions and enforce on routes (P9-014) |
| `babadce` | docs(phase-9): record P9-013 commit ref |
| `4517e65` | feat(notifications): add admin template/mapping/delivery APIs (P9-013) |
| `9d0673b` | docs(phase-9): record P9-012 commit ref |
| `6fce48c` | feat(notifications): add user inbox and preferences API (P9-012) |

---

## 6. Completed Milestones

| Milestone | Status |
|-----------|--------|
| P9-001..P9-013 | ✅ APPROVED / conditions met |
| P9-014 Permissions | ⏳ Awaiting review |

**Deferred:** Phase 6 closeout · BullMQ EventBus → Phase 13.

---

## 7. In Progress Tasks

None — **awaiting CTO review of P9-014** before P9-015.

---

## 8. Pending Tasks (Phase 9)

P9-015 Tests

---

## 9. Open Risks

- Phase 6 not tagged (deferred).
- TD-P2-1 no HTTP integration tests.
- Existing DBs need re-seed (or equivalent upsert) to receive new permission rows.

---

## 10. Architecture Decisions (active)

C-009-1..6 · D-052 notification IAM · Inbox SoT = `notifications` · Handlers → Gateway only.

---

## 11. Known Technical Debt

**P1:** TD-P2-1 · TD-P5-1 · TD-P6-2 · TD-P7A-4 · TD-P7B-1 · TD-P7B-2  
**P2:** TD-P6-1 · TD-P8-1 · TD-P7A-1/2/3 · TD-P7B-3 · TD-EVT-1 · TD-NOTIF-1 · TD-NOTIF-2 · TD-ADMIN-1

---

## 12. Questions For CTO

1. **P9-014** — approve to proceed with **P9-015 Tests**?

---

## 13. Recommended Next Actions

1. Review notification IAM seed + route enforcement (D-052).
2. If approved → **P9-015 Tests**.

**Health:** 114/114 tests · typecheck green · prisma validate green.
