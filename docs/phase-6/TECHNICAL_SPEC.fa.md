# مشخصات فنی — Phase 6: Search & Matching

**پروژه:** ComputerJobs.ir · **فاز:** 6 · **وضعیت:** ✅ Spec APPROVE WITH CONDITIONS — implementation authorized

---

## ۱. Scope

| In | Out |
|----|-----|
| Job Search | LLM · Agents · RAG · Prompting · AI Recommendations |
| Resume Search | Score persistence |
| Search Filters | SavedSearch / SearchQueryLog **tables** (reserved in spec only) |
| Rule-Based Matching + Match Score (on demand) | Rate limiting (TD-P6-2) |

Depends on: Jobs (4) · Resume (5) · Taxonomy/Location (3)

---

## ۲. CTO Conditions

| # | Condition |
|---|-----------|
| 1 | Reserve **SavedSearch** (spec only — no table Phase 6) |
| 2 | Reserve **SearchQueryLog** (spec only — no table Phase 6) |
| 3 | **TD-P6-2** Search Rate Limiting — P1 |
| 4 | Employer resume search: membership in **VERIFIED + ACTIVE** company |
| 5 | MatchScore **on demand** — no DB persistence |
| 6 | Match API response includes `"version": 1` |
| 7 | Reserve future signal: **salary compatibility** (weight 0 Phase 6) |

---

## ۳. Job Search

**API:** `GET /search/jobs` (public)

Filters: `q`, province/city/category/subCategory slugs, `skillIds`, `technologyIds`, `employmentType`, `experienceLevel`, salary range/type, `isRemote`, `companySlug`, `page`, `limit`, `sort`

Constraints: PUBLISHED · not expired · company VERIFIED+ACTIVE  
Sort: `publishedAt` | `expiresAt` | `relevance` (LIKE boost MVP)

---

## ۴. Resume Search

**API:** `GET /search/resumes`  
**Auth:** employer + `search:resumes`  
**Gate:** caller must be member of at least one company with `verificationStatus=VERIFIED` AND `status=ACTIVE`

Filters: `q`, `skillIds`, `technologyIds`, `cityId`/`provinceSlug`, `languageCode`, page/limit  
Constraints: resume `ACTIVE` · visibility `PUBLIC|EMPLOYERS_ONLY` · user ACTIVE · never PRIVATE

---

## ۵. Matching (on demand)

| API | Who |
|-----|-----|
| `GET /search/jobs/:id/match` | seeker — vs own ACTIVE resume |
| `GET /search/jobs/:id/applications/:applicationId/match` | employer — company membership + applicant resume |

**No MatchScore table.** Compute per request.

**Response shape:**

```json
{
  "version": 1,
  "score": 72,
  "breakdown": {
    "skills": 32,
    "technologies": 20,
    "category": 15,
    "location": 5,
    "experienceLevel": 0,
    "salaryCompatibility": null
  }
}
```

`salaryCompatibility` reserved — always `null` Phase 6.

### Weights (v1)

| Signal | Max | Rule |
|--------|-----|------|
| skills | 40 | \|∩\| / \|job.skills\| × 40 (0 if no job skills) |
| technologies | 25 | same |
| category | 15 | job.categoryId equals category of any resume skill’s subcategory parent |
| location | 10 | same city 10 · same province 5 |
| experienceLevel | 10 | N/A on resume Phase 5 — score 0 unless future field; MVP: skip → 0 |
| salaryCompatibility | 0 | reserved |

---

## ۶. Reserved entities (spec only — do not migrate)

### SavedSearch

```text
id, userId, type (JOB|RESUME), filtersJson, createdAt
```

### SearchQueryLog

```text
id, userId?, type, queryHash, filtersJson?, resultCount?, createdAt
```

No Prisma models / APIs for these in Phase 6.

---

## ۷. Module

```text
src/modules/search/
  services/ job-search · resume-search · match
  validators/ search.schema.ts
```

Permissions: `search:jobs` (public route) · `search:resumes` · `match:read:own` · `match:read:employer`

---

## ۸. Technical Debt

| ID | Item | Priority |
|----|------|----------|
| TD-P6-2 | Search Rate Limiting | P1 |
| TD-P6-1 | FULLTEXT / search engine later | P2 |
| TD-P5-1 | Application Resume Snapshot | P1 |
| TD-P2-1 | HTTP integration tests | P1 |

---

## References

Phase 5 — `v0.6-phase-5` · D-028 · `.cto/RULEBOOK.md`
