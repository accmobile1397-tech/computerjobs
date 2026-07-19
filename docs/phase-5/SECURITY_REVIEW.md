# Security Review — Phase 5: Resume Builder

**فاز:** 5 — Spec only

---

## ۱. Threat Summary

| Threat | Mitigation |
|--------|------------|
| IDOR on resume sections | all mutations scoped to `userId` from auth token |
| IDOR employer resume view | company membership + job ownership + application FK |
| PUBLIC resume PII leak | visibility gate; exclude email/mobile from public response |
| Upload malware | **no upload** — N/A |
| Skill injection (free text) | taxonomy FK only — no arbitrary skill names |
| XSS in summary/description | plain text input; sanitize on output |
| Employer browsing all resumes | no list endpoint — application-scoped only |
| Fake resumeId on apply | resume must belong to applicant userId |
| Visibility downgrade after apply | employer access checked at read time per current visibility |

---

## ۲. Public Resume Data

Public response **excludes:**

- user email, mobile, internal UUIDs in URLs
- `deletedAt`, audit metadata
- applications list

Public response **includes:**

- displayName/headline from JobSeekerProfile (if PUBLIC profile alignment — optional sync)
- resume sections per visibility PUBLIC

---

## 3. Visibility Matrix

| Actor | PRIVATE | EMPLOYERS_ONLY | PUBLIC |
|-------|---------|----------------|--------|
| Owner | ✅ full | ✅ full | ✅ full |
| Employer (applicant on own job) | ❌ | ✅ | ✅ |
| Employer (other jobs) | ❌ | ❌ | ✅ slug only |
| Anonymous | ❌ | ❌ | ✅ slug only |

---

## ۴. Audit

All resume and section mutations logged (DATABASE_DESIGN §۶).

---

## ۵. Deferred

- Rate limiting section mutations — Phase 13
- Resume snapshot immutability on apply — future ADR if needed
- GDPR export/delete resume — privacy phase
