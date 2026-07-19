# مشخصات فنی — Phase 6: Search & Matching

**پروژه:** ComputerJobs.ir · **فاز:** 6 · **وضعیت:** ⏳ Spec — awaiting CTO review · **بدون پیاده‌سازی**

---

## ۱. Scope

| In | Out |
|----|-----|
| Job Search | LLM |
| Resume Search | AI Agents |
| Search Filters | RAG |
| Rule-Based Matching Foundation | Prompting |
| Match Score (deterministic) | AI Recommendations |

Depends on: Jobs (4) · Resume (5) · Taxonomy/Location (3)

---

## ۲. Goals

1. **Job Search** — seekers find PUBLISHED jobs beyond basic Phase 4 list filters  
2. **Resume Search** — employers find ACTIVE resumes (visibility rules)  
3. **Search Filters** — structured filters on taxonomy, location, employment, experience, salary, skills/tech  
4. **Rule-Based Matching Foundation** — score job↔resume without ML/LLM  
5. **Match Score** — transparent 0–100 breakdown for explainability

---

## ۳. Job Search

**API (planned):** `GET /search/jobs`

| Filter | Source |
|--------|--------|
| q | title + description text (MySQL FULLTEXT or LIKE MVP) |
| provinceSlug / citySlug | Location |
| categorySlug / subCategorySlug | Taxonomy |
| skillIds / technologyIds | JobSkill + skill→tech |
| employmentType / experienceLevel | Job enums |
| salaryMin / salaryMax / salaryType | Job salary fields |
| isRemote | reserved Job field |
| companySlug | Company |
| page / limit / sort | pagination |

**Constraints:** `status=PUBLISHED`, not expired, company VERIFIED+ACTIVE. Reuse/extend Phase 4 public list — consolidate into `search` module.

**Sort:** `relevance` (text+boost) · `publishedAt` · `expiresAt`

---

## ۴. Resume Search

**API (planned):** `GET /search/resumes`  
**Auth:** employer · `resume:search` (new) or reuse `resume:read:employer` with search scope

| Filter | Source |
|--------|--------|
| q | resume summary + experience titles |
| skillIds / technologyIds | ResumeSkill / ResumeTechnology |
| cityId / provinceSlug | experience city or profile cityId |
| experienceLevel (derived) | optional heuristic from years — MVP skip if ambiguous |
| languageCode | ResumeLanguage |
| page / limit | |

**Constraints:** `status=ACTIVE` · `visibility IN (PUBLIC, EMPLOYERS_ONLY)` · user ACTIVE · **no PRIVATE**  
**No browse of PRIVATE resumes.** Rate-limit deferred (TD carry).

---

## ۵. Rule-Based Matching Foundation

**Module:** `src/modules/search/` (or `matching/` subfolder)

| Operation | API |
|-----------|-----|
| Score job vs seeker’s ACTIVE resume | `GET /jobs/:id/match` (seeker) |
| Score resume vs job (employer) | `GET /jobs/:id/applications/:appId/match` or `POST /match` body `{jobId,resumeId}` |

**Inputs only:** structured fields (skills, technologies, category, city, employmentType, experienceLevel).  
**No** embeddings, LLM, RAG, or external AI calls.

---

## ۶. Match Score (deterministic)

Suggested weights (tunable constants — document in code):

| Signal | Weight | Rule |
|--------|--------|------|
| Skill overlap | 40 | \|intersection\| / \|job.skills\| (0 if job has 0 skills) |
| Technology overlap | 25 | same pattern on technologies |
| Category match | 15 | resume experience category proxy OR seeker preferred — MVP: job.categoryId vs most common skill subcategory parent |
| Location | 10 | same city=10 · same province=5 · else 0 |
| Experience level | 10 | exact=10 · adjacent=5 · else 0 |

**Output:**

```json
{
  "score": 72,
  "breakdown": {
    "skills": 32,
    "technologies": 20,
    "category": 15,
    "location": 5,
    "experienceLevel": 0
  }
}
```

Cap 100. Missing resume → 404. DRAFT resume → not scorable for public match.

---

## ۷. Architecture

```text
src/modules/search/
  services/
    job-search.service.ts
    resume-search.service.ts
    match.service.ts
  validators/
    search.schema.ts
```

Jobs/resumes modules remain owners of entities — search **reads** only.

**Indexes:** ensure JobSkill, ResumeSkill, FULLTEXT if used. Prefer Prisma + SQL; Elasticsearch **out of Phase 6** unless CTO requests.

---

## ۸. Permissions

| Permission | Use |
|------------|-----|
| `search:jobs` | public job search (anonymous OK at route) |
| `search:resumes` | employer resume search |
| `match:read:own` | seeker match vs job |
| `match:read:employer` | employer match on applicant |

---

## ۹. Audit / Observability

Optional: log search queries aggregated (no PII dump). Match calls not audited every time — sample or skip Phase 6.

---

## ۱۰. Technical Debt (carry)

| ID | Note |
|----|------|
| TD-P5-1 | Snapshot still needed for fair historical match — matching uses **live** resume |
| TD-P2-1 | Integration tests |
| TD-P6-1 | (propose) FULLTEXT → dedicated search engine later |

---

## ۱۱. Acceptance Gate

CTO APPROVE TECHNICAL_SPEC → implement on `main`.  
**Do not implement** until APPROVE.

---

## References

Phase 5 closed — `v0.6-phase-5` · Roadmap D-028 · `.cto/RULEBOOK.md`
