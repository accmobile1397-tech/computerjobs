# Risks and Assumptions — Phase 2: Profiles & Companies

**فاز:** 2 — Spec

---

## ۱. Assumptions

| ID | Assumption |
|----|------------|
| A-1 | One primary company per employer in Phase 2 |
| A-2 | `cityLabel` free text until Location Phase 3 |
| A-3 | `industryLabel` free text until Taxonomy Phase 3 |
| A-4 | Avatar/logo as URL string — upload API deferred |
| A-5 | Invite email via console/queue stub (same as Phase 1) |
| A-6 | Company public page API-only — no Next.js UI required Phase 2 |
| A-7 | Slug generated server-side from name if omitted |
| A-8 | Persian slug transliteration library acceptable |

---

## ۲. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | IDOR on company routes | Med | High | membership middleware + tests |
| R2 | Slug collision / squatting | Med | Med | reserved slugs list; admin override |
| R3 | Invite sent to wrong email | Low | Med | confirm email match on accept |
| R4 | Ownership transfer abuse | Low | High | OWNER-only + audit + confirm body |
| R5 | Profile visibility misconfiguration | Med | Med | explicit enum; default PRIVATE |
| R6 | Schema drift vs Location Phase 3 | Med | Med | document cityId migration path |
| R7 | Over-permissive company:members | Med | Med | minimal seed; CTO review permissions |

---

## ۳. Dependencies

| Dependency | Required for |
|------------|--------------|
| Phase 1 IAM | JWT, RBAC, User profiles skeleton |
| Phase 1 Company skeleton | extend, not replace |
| modules/authorization | all write paths |
| modules/shared/storage | future logo upload |

---

## ۴. CTO Conditions (from Phase 1 closure)

| Condition | Phase 2 impact |
|-----------|----------------|
| Shared module migration continues | use `modules/shared/` only |
| Taxonomy skeleton planned | `industryLabel` string only |
| Location skeleton planned | `cityLabel` string only |

---

## ۵. Deferred to Later Phases

| Item | Phase |
|------|-------|
| cityId FK | 3 Location |
| industryTaxonomyId FK | 3 Taxonomy |
| S3 presigned upload | storage hardening |
| Company SEO pages | SEO phase |
| Job posting by company | Jobs phase |

---

## ۶. Open Questions for CTO

| # | Question | Default |
|---|----------|---------|
| Q1 | Allow employer without company initially? | yes — create later |
| Q2 | Multiple companies per user Phase 2? | no |
| Q3 | Admin verify employer + company separately? | yes — two statuses |
