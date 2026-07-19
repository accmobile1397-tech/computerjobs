# RFC-002 — AI Architecture

**Status:** ✅ **APPROVED / FROZEN / CLOSED** (CTO APPROVE WITH CONDITIONS — conditions applied 2026-07-19)  
**Tag:** `v0.8-ai-rfc` · **Decision:** D-044  
**ID:** RFC-002  
**Audience:** ComputerJobs.ir as AI-Native hiring platform  
**Depends on:** RFC-001 (credits/plans) · Phase 7A wallet reserve/capture · Phase 6 rule-based MatchScore

---

## 1. Purpose

Freeze cross-cutting AI decisions so Phase 8+ specs stay thin and token-cheap:

- AI Gateway shape (provider-agnostic)  
- Cost protection · credit consumption  
- Prompt registry · safety (moderate)  
- Provider fallback + health (reserved) · model routing  
- Rate limits · observability · graceful degradation  

**Non-goal:** Implementing features in this RFC.

---

## 2. Principles

1. **Search & apply work without AI** — AI enhances; never blocks core flows (align ADR-0003 / legacy ai-matching RFC).
2. **Provider-agnostic gateway only** — see §3 Rule (Condition 1).
3. **Credits first** — every billable AI op: estimate → RESERVE → call → CAPTURE | RELEASE (7A ledger).
4. **Data-driven limits** — rate/cost/routing from `PlanFeature` / `SystemSetting`; no hardcoded quotas or model ids in feature TS.
5. **Explainability** — AI outputs include `provider`, `model`, `requestId`, optional `rationale` summary; never silent.
6. **PII minimization** — redact email/mobile before provider; log hashes/ids not raw contact fields.
7. **Diff-only evolution** — change providers under `ai/providers/` without rewriting features.
8. **Prompts are assets** — versioned files under `prompts/`; never inline prompt strings in services (Condition 3).

---

## 3. Condition 1 — Provider-Agnostic Gateway (HARD RULE)

**No feature module may call provider SDKs directly.**

Forbidden from jobs / resumes / search / matching / any non-gateway code:

- OpenRouter SDK  
- Gemini SDK  
- Ollama SDK  
- 9Router SDK  
- Any other PSP/AI vendor client  

**Only** `src/modules/ai/gateway` may invoke `src/modules/ai/providers/*`.

Feature modules call **gateway only** (`complete` / `embed` / `moderate` entrypoints — never a provider class).

Violations = architecture breach; blocked in review.

---

## 4. Module layout (frozen)

```text
src/modules/ai/
  gateway/          # sole entry: complete(), embed(), moderate()
  providers/        # Phase 8: stub · openrouter · gemini · (local = TD-P8-1)
  matching/         # AI match enhancement (optional overlay on Phase 6 score)
  resume/           # suggestions (future) — no upload parsing
  jobs/             # JD assist (future)
  prompts/          # REQUIRED registry — versioned prompt files only
    match-explain.v1.md
    job-improve.v1.md
  types/
```

---

## 5. Gateway contract (Requirement)

Mandatory surface (Condition 4):

| Method | Role |
|--------|------|
| `complete()` | Chat/completion after estimate + moderate + reserve |
| `embed()` | Embeddings (same cost/safety gates when billable) |
| `moderate()` | **Required** before every provider call |

```text
AiRequest {
  featureKey: string          // e.g. ai.match.explain
  ownerType / ownerId         // USER | COMPANY for credits
  requestId: string           // idempotency 24h
  input: redacted payload
  promptId: string            // registry id, e.g. match-explain.v1
  maxCredits?: number         // allowedCredits ceiling
}

AiResponse {
  ok: boolean
  provider: string
  model: string
  creditsCaptured: number
  estimatedCredits?: number
  data?: unknown
  errorCode?:
    AI_UNAVAILABLE
    | QUOTA_EXCEEDED
    | AI_CREDIT_REQUIRED      // 402 — estimate > allowed
    | AI_RATE_LIMITED         // 429
    | MODERATION_BLOCKED
}
```

If gateway / `AI_UNAVAILABLE`: features degrade (hide AI panels; keep rule-based MatchScore v1).

### Call pipeline (frozen order)

```text
1. resolveModel(featureKey)     // Model Routing (§9)
2. loadPrompt(promptId)         // Prompt Registry (§7)
3. estimateCost(request)        // Cost Protection (§6) — REQUIRED
4. if estimated > allowed → 402 AI_CREDIT_REQUIRED  (no provider call)
5. moderate(input + prompt)     // Safety (§8) — REQUIRED
6. if blocked → MODERATION_BLOCKED
7. RESERVE credits
8. provider.complete|embed via gateway only
9. CAPTURE | RELEASE
```

---

## 6. Condition 2 — Cost Protection Layer

Before **any** provider call, gateway **must** run:

`estimateCost(AiRequest) → estimatedCredits`

If `estimatedCredits > allowedCredits` (plan/wallet/`maxCredits`):

- Return **HTTP 402** / errorCode **`AI_CREDIT_REQUIRED`**
- **Do not** call the provider  
- **Do not** RESERVE/CAPTURE  

Purpose: prevent burning credits on oversized prompts/payloads.

`estimateCost` may use token heuristics + model pricing from SystemSetting; exact formula is Phase 8 detail — behavior is frozen here.

---

## 7. Condition 3 — Prompt Registry

Prompts **must not** be written inside services.

**Allowed:**

```text
src/modules/ai/prompts/
  match-explain.v1.md
  job-improve.v1.md
```

**Forbidden:**

```ts
const prompt = `
...100 lines...
`
```

Benefits: lower token waste in codebase/reviews, versioning, A/B via `*.v2.md` + routing setting.

Gateway loads by `promptId`; metadata logs `promptId` + version.

---

## 8. Condition 4 — AI Safety Layer

Before every provider call, gateway **must** call `moderate()`.

- Fail-closed on moderation errors in production (configurable via SystemSetting for stub/dev).  
- Blocked content → `MODERATION_BLOCKED` — no credit CAPTURE for provider usage (RELEASE if reserved).

`complete` / `embed` / `moderate` are **requirements**, not optional helpers.

---

## 9. Condition 5 — Provider Health Tracking

| Item | Status |
|------|--------|
| SystemSetting `ai.providerHealthWindow` | **Required** in Phase 8 seed (window size for health samples) |
| Table `AiProviderHealth` | **Reserved** — schema deferred; do not implement until CTO opens debt/phase |

Purpose (future): smart failover, auto-disable unhealthy providers.

Phase 8 may log latency/errors to metrics only; persistence table is reserved.

---

## 10. Condition 6 — Model Routing

**Replace** single `ai.defaultModel` with feature-keyed routing.

SystemSetting key: `ai.modelRouting` (JSON), example:

```json
{
  "ai.match.explain": "gemini-flash",
  "ai.job.improve_description": "gpt-oss-120b",
  "ai.chat.assist": "deepseek"
}
```

- Change models **without deploy** (admin/settings).  
- Gateway `resolveModel(featureKey)` reads this map; unknown key → fallback setting `ai.modelRoutingDefault` (not a hardcoded default in feature code).  
- `ai.defaultModel` is **deprecated** — do not use in Phase 8+.

---

## 11. Provider strategy

| Priority | Provider | Role |
|----------|----------|------|
| 1 | `activeAiProvider` SystemSetting | Primary (seed: `stub` → prod: openrouter / gemini / 9router) |
| 2 | `ai.fallbackProviders` JSON array | On timeout/5xx / future health disable |
| 3 | `local` (Ollama-compatible) | Optional — **TD-P8-1** (not required for Phase 8) |
| — | `stub` | Tests / CI |

Adapters live only under `providers/`. Credentials: env / secret store — never in repo.

---

## 12. Credit consumption

| Feature key (examples) | Default cost (seed — admin editable) |
|------------------------|--------------------------------------|
| `ai.match.explain` | 1 |
| `ai.resume.suggest_summary` | 2 |
| `ai.job.improve_description` | 2 |
| `ai.chat.assist` | per message setting |

Flow: **estimateCost** → (402 if over) → moderate → RESERVE → provider → CAPTURE actual (≤ reserve) or RELEASE.  
TD-P7A-4 stress testing remains open.

---

## 13. Rate limits

SystemSettings (examples):

- `ai.rate.per_user_per_minute`  
- `ai.rate.per_company_per_minute`  
- `ai.rate.global_per_minute`  
- `ai.timeout_ms`  
- `ai.providerHealthWindow`  

Exceed rate → `429` / `AI_RATE_LIMITED` without calling provider.

---

## 14. Observability

- Audit: `AI_CREDIT_*` already; add `AI_REQUEST_COMPLETED` / `AI_REQUEST_FAILED` in Phase 8.  
- Metrics: latency, provider, featureKey, model, estimated/captured credits (no prompt body).  
- Prompt versions: `promptId` + `promptVersion` in metadata.

---

## 15. Explicit non-goals (Phase 8+)

- RAG corpus as default matching (optional later RFC)  
- Autonomous agents applying to jobs  
- Training on user data without consent flag  
- Replacing Phase 6 deterministic MatchScore as sole score  
- Implementing `AiProviderHealth` table before CTO opens it  

---

## 16. Relation to Phase 8

Phase 8 TECHNICAL_SPEC cites this RFC (Conditions 1–6) + P8-1…4.  
RFC closed with tag `v0.8-ai-rfc`. Phase 8 implementation **AUTHORIZED** (D-045).

---

## CTO Decision Log

| Date | Decision |
|------|----------|
| 2026-07-19 | APPROVE WITH CONDITIONS (1–6) |
| 2026-07-19 | Conditions applied → **APPROVED / FROZEN** |
| 2026-07-19 | **CLOSED** · tag `v0.8-ai-rfc` · D-044 |

- [x] APPROVE WITH CONDITIONS  
- [x] Conditions incorporated — **FROZEN**  
- [x] **CLOSED** (`v0.8-ai-rfc`)
