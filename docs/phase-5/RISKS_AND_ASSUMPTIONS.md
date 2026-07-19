# Risks and Assumptions — Phase 5: Resume Builder

**فاز:** 5 — Spec only

---

## ۱. Assumptions

| ID | Assumption |
|----|------------|
| A-1 | One resume per user sufficient for MVP — no templates/variants |
| A-2 | Live resume FK on application (no snapshot) acceptable for MVP |
| A-3 | Apply without resume remains valid (Phase 4 backward compatible) |
| A-4 | Taxonomy Skill/Technology IDs stable — resume references by FK |
| A-5 | completionScore algorithm tunable post-launch |
| A-6 | PUBLIC resume via user slug — no separate resume slug |
| A-7 | Persian + English language names stored explicitly |

---

## ۲. Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | Large section lists slow PATCH | pagination N/A; hard caps on M2M |
| R2 | Employer sees changed resume after apply | document A-2; snapshot ADR later if needed |
| R3 | Taxonomy skill deactivated | read still works; warn on update if inactive |
| R4 | User deletes education with gap validation | date range validation |
| R5 | Profile visibility vs resume visibility confusion | separate enums; document in API |

---

## ۳. Dependencies

Phase 4 closed — `v0.5-phase-4` · JobApplication.resumeId column exists.  
Phase 3 Taxonomy — Skill, Technology active flags.  
Phase 2 JobSeekerProfile — displayName for public resume header.

---

## ۴. Open Questions

| # | Question | Default if unresolved |
|---|----------|----------------------|
| Q1 | Auto-create empty resume on first GET? | Yes — on first PATCH/GET |
| Q2 | PDF export in Phase 5? | No — defer |
| Q3 | Sync resume visibility with profile visibility? | Independent |

---

## ۵. Explicit Non-Goals

- Resume file upload (PDF/DOCX)
- AI text generation or scoring
- Matching engine / job-resume ranking
- Full-text resume search
