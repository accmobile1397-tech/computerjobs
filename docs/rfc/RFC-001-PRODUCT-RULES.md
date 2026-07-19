# RFC-001 — Product Rules

**Status:** ⏳ Awaiting CTO Approval  
**ID:** RFC-001-A  
**Companion:** [RFC-001-MONETIZATION.md](./RFC-001-MONETIZATION.md)  
**Goal:** Freeze business rules before Phase 7 (Payments & Plans)  
**Scope:** Product behavior only — **no implementation** in this RFC  
**Depends on:** Phases 1–6 delivered capabilities (IAM, Companies, Jobs, Resume, Search/Match)

---

## 0. Principles

1. Free tier must remain useful for core seeker + light employer flows.
2. Monetization gates **premium actions**, not reading public job listings.
3. Contact data (email/mobile) is never exposed without an Unlock event.
4. Limits are **server-enforced**; UI is advisory only.
5. All consumable quotas reset on plan period boundary (default: calendar month UTC+03:30 / Asia/Tehran — CTO confirm).
6. Numbers below are **proposed defaults** — change only via CTO amendment to this RFC.

---

## 1. Job Seeker Limits

| Action | Free | Paid (Seeker Pro) |
|--------|------|-------------------|
| Active resumes | 1 | 1 (unchanged — multi-resume deferred) |
| Applications / month | 30 | 100 |
| Saved searches | 3 | 20 |
| Job alerts | 3 | 20 |
| MatchScore calls / day | 50 | 200 |
| Public resume (visibility=PUBLIC) | ✅ | ✅ |
| AI features | Credits only (see Monetization §7) | Credits included + purchasable |

**Rules**

- Apply without resume allowed (Phase 4/5 compatibility).
- DRAFT resume cannot be attached on apply; ACTIVE only.
- Soft-deleted / banned users: all actions blocked.
- Seekers cannot unlock other seekers’ contact data.

---

## 2. Employer Limits

Requires: company membership + company `VERIFIED` + `ACTIVE` for paid/search/contact actions (align Phase 6).

| Action | Free | Starter | Growth | Enterprise |
|--------|------|---------|--------|------------|
| Concurrent PUBLISHED jobs | 1 | 5 | 20 | Custom |
| Job posts / month (publish→PENDING_REVIEW) | 1 | 10 | 40 | Custom |
| Resume search queries / day | 20 | 100 | 500 | Custom |
| Resume profile views / month | 20 | 150 | 500 | Custom |
| Contact unlocks / month | 0 | 30 | 150 | Custom |
| Featured job slots | 0 | 1 | 5 | Custom |
| Urgent job flags | 0 | 3 | 15 | Custom |
| Team seats (company members) | 2 | 5 | 15 | Custom |
| MatchScore (applicant) / day | 50 | 200 | 1000 | Custom |

**Rules**

- Draft jobs unlimited; **publish** consumes job-post quota.
- Pause/close does not refund quota; republish of same job within 7 days does not consume again.
- Unverified companies: CRUD drafts only — no publish, no resume search, no unlock.
- Suspended company: all employer actions blocked; existing PUBLISHED jobs force-closed.

---

## 3. Resume Viewing Rules

| Viewer | PRIVATE | EMPLOYERS_ONLY | PUBLIC |
|--------|---------|----------------|--------|
| Owner | Full | Full | Full |
| Employer (applicant on own job) | ❌ | Full (no contact) | Full (no contact) |
| Employer (resume search) | ❌ | Teaser + Full after view credit | Teaser + Full after view credit |
| Anonymous / seeker | ❌ | ❌ | Public fields only |

**Teaser (pre-view):** displayName, headline, skills (≤10), city label, completionScore — **no** summary full text, experience detail, projects, certificates, email, mobile.

**Full view:** all resume sections except contact fields (see §4).

**Rules**

- Each employer→resume pair counts **one** view credit per 30 days (re-open free within window).
- Viewing applicant resume on own job application: **does not** consume view credit.
- MatchScore does not imply a resume view credit.
- Live resume FK (TD-P5-1): view reflects current resume; snapshot deferred.

---

## 4. Contact Unlock Rules

**Contact fields:** user email, mobile (when verified), optional resume-linked social URLs marked `isContact`.

| Rule | Detail |
|------|--------|
| Prerequisite | Full resume view already granted (or application context) |
| Cost | 1 unlock credit (plan quota or à-la-carte pack) |
| Scope | Per employer company → candidate user (not per job) |
| Duration | Permanent for that company (until candidate deletes account) |
| Shared seats | All members of unlocking company may see unlocked contact |
| Audit | `CONTACT_UNLOCKED` with companyId, targetUserId, actorUserId |
| Refund | No automatic refund; abuse → admin credit restore |

**Forbidden**

- Unlock without VERIFIED+ACTIVE company.
- Export bulk contacts / API scrape (rate limit + fingerprint — TD-P6-2 related).
- Showing contact in public resume HTML/JSON ever.

---

## 5. Subscription Plans

Canonical plan IDs (implementation Phase 7):

### Seeker

| Plan ID | Period | Role |
|---------|--------|------|
| `seeker_free` | — | Default |
| `seeker_pro` | monthly / yearly | Higher apply + AI credits |

### Employer (per company)

| Plan ID | Period | Role |
|---------|--------|------|
| `employer_free` | — | Default |
| `employer_starter` | monthly / yearly |
| `employer_growth` | monthly / yearly |
| `employer_enterprise` | custom contract |

**Rules**

- One active paid plan per company; upgrade prorates; downgrade at period end.
- Seat overage: block invite until upgrade or seat freed.
- Plan entitlements are source of truth for quotas (§1–2); packs add consumables (§6).

---

## 6. Consumption-Based Billing

Consumables (may be granted by plan **or** purchased packs):

| Consumable | Unit | Used by |
|------------|------|---------|
| `job_post` | 1 publish | Employer |
| `resume_view` | 1 unique view / 30d | Employer |
| `contact_unlock` | 1 company↔user | Employer |
| `featured_day` | 1 job × 1 day | Employer |
| `ai_credit` | 1 opaque credit | Seeker / Employer |

**Rules**

- Deduct **after** successful action (optimistic UI OK; reconcile on failure).
- Insufficient balance → `402 PAYMENT_REQUIRED` / `QUOTA_EXCEEDED` with upgrade hint.
- Packs never expire unless pack SKU says otherwise (default: 12 months).
- Period plan quotas do not roll over unless plan flag `rollover=true` (default false).

---

## 7. AI Credit Reservation

Phase 8 implements AI; **rules frozen now**:

| Rule | Detail |
|------|--------|
| No free unlimited AI | Every AI call costs ≥1 `ai_credit` |
| Reserve-then-settle | `RESERVE` → provider call → `CAPTURE` or `RELEASE` |
| Idempotency | client `requestId` unique per user/company 24h |
| Failure | RELEASE reserved credits |
| Partial multi-step | Reserve max estimate; capture actual; release remainder |
| Who pays | Seeker features → seeker wallet; Employer AI (JD rewrite, rank assist) → company wallet |

**Out of RFC-001 implementation:** providers, prompts, RAG — Phase 8.

---

## 8. Advertisement Rules

| Placement | Who buys | Constraint |
|-----------|----------|------------|
| Job `isFeatured` | Employer (consumable) | Max N featured per list page (product: 3) |
| Job `isUrgent` | Employer | Badge only; not a separate inventory |
| Homepage / category banners | Ad account / admin | Separate `ads` module — Phase TBD |
| Resume sidebar | Forbidden | No ads on candidate private data surfaces |

**Rules**

- Featured boosts sort only within Phase 6 relevance/publishedAt — no LLM ranking.
- Ads labeled «آگهی» / sponsored for compliance.
- Political / adult / crypto-scam categories blocked (admin denylist).

---

## 9. Anti-Abuse Rules

| Vector | Control |
|--------|---------|
| Multi-account unlock farm | Device/IP velocity; same national ID later (optional) |
| Scraping resume search | TD-P6-2 rate limits; CAPTCHA on anomaly |
| Fake companies | VERIFIED gate; admin suspend |
| Job spam | PENDING_REVIEW; quota; duplicate title hash soft-block |
| Contact misuse | Unlock audit; report button; ban company |
| Apply spam | Seeker monthly cap; duplicate apply blocked |
| AI credit drain | Reserve caps per minute; max parallel reserves |

**Enforcement ladder:** warn → soft throttle → suspend user/company → ban.

---

## 10. Cross-Cutting Product Constraints (from prior phases)

- No resume file upload (RFC resume-builder).
- MatchScore on demand, not persisted (Phase 6).
- User owns slug; resume has no slug (Phase 5).
- Public jobs only PUBLISHED + verified company (Phase 4/6).

---

## CTO Checklist

- [ ] APPROVE
- [ ] APPROVE WITH CONDITIONS (amend numbers)
- [ ] REJECT

**After APPROVE:** generate Phase 7 TECHNICAL_SPEC from this RFC + [RFC-001-MONETIZATION.md](./RFC-001-MONETIZATION.md).  
**No coding until Phase 7 spec APPROVE.**
