# RFC-002 — AI Architecture

**Status:** ⏳ Awaiting CTO Approval (freeze before Phase 8 implementation)  
**ID:** RFC-002  
**Audience:** ComputerJobs.ir as AI-Native hiring platform  
**Depends on:** RFC-001 (credits/plans) · Phase 7A wallet reserve/capture · Phase 6 rule-based MatchScore

---

## 1. Purpose

Freeze cross-cutting AI decisions so Phase 8+ specs stay thin and token-cheap:

- AI Gateway shape  
- Credit consumption  
- Provider fallback (OpenRouter · Gemini · local models)  
- Rate limits · observability · graceful degradation  

**Non-goal:** Implementing features in this RFC.

---

## 2. Principles

1. **Search & apply work without AI** — AI enhances; never blocks core flows (align ADR-0003 / legacy ai-matching RFC).
2. **All AI calls go through `src/modules/ai/gateway/`** — no direct SDK in jobs/resumes/search feature code.
3. **Credits first** — every billable AI op: RESERVE → call → CAPTURE | RELEASE (7A ledger).
4. **Data-driven limits** — rate/cost caps from `PlanFeature` / `SystemSetting`; no hardcoded quotas in TS.
5. **Explainability** — AI outputs include `provider`, `model`, `requestId`, optional `rationale` summary; never silent.
6. **PII minimization** — redact email/mobile before provider; log hashes/ids not raw contact fields.
7. **Diff-only evolution** — change providers under `ai/providers/` without rewriting features.

---

## 3. Module layout (frozen)

```text
src/modules/ai/
  gateway/          # sole entry: complete(), embed(), moderate()
  providers/        # openrouter · gemini · local · stub
  matching/         # AI match enhancement (optional overlay on Phase 6 score)
  resume/           # suggestions (future) — no upload parsing
  jobs/             # JD assist (future)
  prompts/          # versioned prompt templates (ids, not inline sprawl)
  types/
```

Feature modules call **gateway only**.

---

## 4. Gateway contract

```text
AiRequest {
  featureKey: string          // e.g. ai.match.explain
  ownerType / ownerId         // USER | COMPANY for credits
  requestId: string           // idempotency 24h
  input: redacted payload
  maxCredits?: number
}

AiResponse {
  ok: boolean
  provider: string
  model: string
  creditsCaptured: number
  data?: unknown
  errorCode?: AI_UNAVAILABLE | QUOTA_EXCEEDED | MODERATION_BLOCKED
}
```

If gateway/`AI_UNAVAILABLE`: features degrade (hide AI panels; keep rule-based MatchScore v1).

---

## 5. Provider strategy

| Priority | Provider | Role |
|----------|----------|------|
| 1 | `activeAiProvider` SystemSetting | Primary (seed: `stub` → prod: `openrouter` or `gemini`) |
| 2 | Fallback chain in SystemSetting `ai.fallbackProviders` JSON array | On timeout/5xx |
| 3 | `local` (optional Ollama-compatible) | Offline / cost control |
| — | `stub` | Tests / CI |

**OpenRouter:** multi-model router; model id from SystemSetting `ai.defaultModel`.  
**Gemini:** first-party Google provider adapter.  
**Local:** OpenAI-compatible base URL from settings — no cloud PII if `ai.localOnly=true`.

No provider credentials in repo — env / secret store.

---

## 6. Credit consumption

| Feature key (examples) | Default cost (seed — admin editable) |
|------------------------|--------------------------------------|
| `ai.match.explain` | 1 |
| `ai.resume.suggest_summary` | 2 |
| `ai.job.improve_description` | 2 |
| `ai.chat.assist` | per message setting |

Flow: `ai-credit.service` RESERVE → gateway → CAPTURE actual (≤ reserve) or RELEASE.  
TD-P7A-4 stress testing remains open.

---

## 7. Rate limits

SystemSettings (examples):

- `ai.rate.per_user_per_minute`  
- `ai.rate.per_company_per_minute`  
- `ai.rate.global_per_minute`  
- `ai.timeout_ms`

Exceed → `429` / `AI_RATE_LIMITED` without calling provider.

---

## 8. Observability

- Audit: `AI_CREDIT_*` already; add `AI_REQUEST_COMPLETED` / `AI_REQUEST_FAILED` in Phase 8.  
- Metrics: latency, provider, featureKey, credits (no prompt body in metrics).  
- Prompt versions: `promptId` + `promptVersion` in metadata.

---

## 9. Explicit non-goals (Phase 8+)

- RAG corpus as default matching (optional later RFC)  
- Autonomous agents applying to jobs  
- Training on user data without consent flag  
- Replacing Phase 6 deterministic MatchScore as sole score  

---

## 10. Relation to Phase 8

Phase 8 TECHNICAL_SPEC **must** cite this RFC and only detail feature slices (gateway wiring, first features).  
**No Phase 8 coding until:** RFC-002 APPROVE **and** Phase 8 TECHNICAL_SPEC APPROVE.

---

## CTO Checklist

- [ ] APPROVE
- [ ] APPROVE WITH CONDITIONS
- [ ] REJECT
