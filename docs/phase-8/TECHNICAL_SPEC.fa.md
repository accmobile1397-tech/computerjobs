# مشخصات فنی — Phase 8: AI Gateway & AI Features

**پروژه:** ComputerJobs.ir · **فاز:** 8  
**وضعیت:** ✅ **APPROVE WITH MINOR CONDITIONS** — implementation **AUTHORIZED**  
**Prerequisite:** [RFC-002](../rfc/RFC-002-AI-ARCHITECTURE.md) ✅ FROZEN · Tag `v0.8-ai-rfc`  
**Approval:** [CTO_SPEC_APPROVAL.md](./CTO_SPEC_APPROVAL.md)

---

## ۱. Scope (locked — P8-1 / P8-2)

| In | Out |
|----|-----|
| AI Gateway (`modules/ai/gateway`) only — provider-agnostic | Feature→SDK direct calls |
| Providers **required:** `stub` · `openrouter` · `gemini` (P8-3) | `local` (optional → **TD-P8-1**) |
| Pipeline: estimateCost → moderate → RESERVE → call → CAPTURE | Inline prompts in services |
| Prompt registry `prompts/*.vN.md` | Hardcoded credit/model ids |
| `ai.modelRouting` JSON · `ai.providerHealthWindow` seed | `AiProviderHealth` table (reserved) |
| **Only** `ai.match.explain` + `ai.job.improve_description` | Any other AI feature |
| Response meta on every AI call (P8-4) | Resume AI Suggest → **Phase 8.1** |
| Graceful degradation · 402 `AI_CREDIT_REQUIRED` | Replacing Phase 6 MatchScore |

---

## ۲. Architecture

Cite **RFC-002 Conditions 1–6**. Skeleton + **exactly two** features.

### Features (P8-1 — exclusive)

1. **`ai.match.explain`** — optional explanation overlay on Phase 6 score (does not persist MatchScore).  
2. **`ai.job.improve_description`** — employer draft assist (credits from company wallet).  

**P8-2:** Resume AI Suggest — **removed from Phase 8** → Phase **8.1**.

### Providers (P8-3)

| Provider | Phase 8 |
|----------|---------|
| `stub` | Required |
| `openrouter` | Required |
| `gemini` | Required |
| `local` | Optional — **TD-P8-1** (do not block close) |
| `9router` | Out of Phase 8 scope |

### Response metadata (P8-4 — every AI call)

Every successful AI API response **must** include:

```json
{
  "provider": "...",
  "model": "...",
  "requestId": "...",
  "creditsCaptured": 1
}
```

(Alongside feature `data` payload.)

---

## ۳. Integration

- Entitlements: 7A `ai_credit` + feature keys from PlanFeature.  
- No AI in public anonymous search path.  
- Queue optional for long jobs via BullMQ — owner `ai` module.

---

## ۴. Permissions

`ai:use:own` · `ai:use:company` · `ai:admin` (settings)

---

## ۵. Acceptance gate

1. ~~RFC-002 FROZEN~~ ✅ · tag `v0.8-ai-rfc`  
2. ~~TECHNICAL_SPEC APPROVE WITH MINOR CONDITIONS~~ ✅ (P8-1…4 applied)  
3. **Implement** on `main` (diff-only: `modules/ai/**` + thin route wiring)

**Implementation AUTHORIZED.**
