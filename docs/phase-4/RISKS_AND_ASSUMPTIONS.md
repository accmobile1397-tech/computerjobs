# Risks and Assumptions — Phase 4: Jobs Core

**فاز:** 4 — Spec only

---

## ۱. Assumptions

| ID | Assumption |
|----|------------|
| A-1 | One free job post per company MVP — payment rules Phase 7 |
| A-2 | Application without resume is acceptable until Phase 5 |
| A-3 | Plain text job description Phase 4 |
| A-4 | Expiry job via `expiresAt` — cron/worker Phase 4 or 4.1 |
| A-5 | Employer must belong to company with OWNER/ADMIN for publish |
| A-6 | Public list API-only — no SSR job pages |

---

## ۲. Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | Large job list performance | indexes + pagination |
| R2 | Skill M2M explosion | max 10 skills per job |
| R3 | Application without resume low value | Phase 5 resume FK ready |
| R4 | Expired jobs not auto-updated | scheduled task documented |
| R5 | Cross-company application access | strict company membership checks |

---

## ۳. Dependencies

Phase 3 Location + Taxonomy closed (`v0.4-phase-3`).  
Phase 2 Company verification workflow.

---

## ۴. Open Questions

| # | Question | Default |
|---|----------|---------|
| Q-1 | Auto-expire cron in Phase 4? | Yes — simple daily job in worker skeleton |
| Q-2 | PAUSED jobs editable? | Yes — full edit then re-publish |

_Awaiting CTO spec review._
