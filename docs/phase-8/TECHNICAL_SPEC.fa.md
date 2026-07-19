# مشخصات فنی — Phase 8: AI Gateway & AI Features

**پروژه:** ComputerJobs.ir · **فاز:** 8 · **وضعیت:** ⏳ Spec — awaiting CTO review · **بدون پیاده‌سازی**

**Prerequisite:** [RFC-002-AI-ARCHITECTURE.md](../rfc/RFC-002-AI-ARCHITECTURE.md) must be APPROVED before coding.

---

## ۱. Scope

| In | Out |
|----|-----|
| AI Gateway (`modules/ai/gateway`) | RAG-first matching (future RFC) |
| Provider adapters: stub · openrouter · gemini · local | Autonomous apply agents |
| Credit RESERVE/CAPTURE on real calls | Hardcoded credit costs |
| First features: match explain · optional JD/resume suggest | Replacing Phase 6 MatchScore |
| Graceful degradation | Training on private data |
| SystemSettings for provider/model/rate limits | — |

---

## ۲. Architecture

Cite RFC-002 for gateway contract, fallback, credits, rate limits, module layout.  
Phase 8 implements the skeleton + 1–2 vertical features only.

### Features (MVP)

1. **`ai.match.explain`** — optional explanation overlay on Phase 6 score (does not persist MatchScore).  
2. **`ai.job.improve_description`** — employer draft assist (credits from company wallet).  

Resume AI suggest: optional if credits/time; else Phase 8.1.

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

1. CTO APPROVE RFC-002  
2. CTO APPROVE this TECHNICAL_SPEC  
3. Then implement on `main` (diff-only: `modules/ai/**` + thin route wiring)

**Do not implement until both approvals.**
