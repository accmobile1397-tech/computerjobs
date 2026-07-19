# ADR-0003: AI Gateway Module Structure

**Status:** Accepted  
**Date:** 2026-07-19  
**Deciders:** CTO, Architecture  

## Context

AI features span multiple concerns: providers, fallback, tokens, queues, matching. A single `ai/` folder would become a god module.

## Decision

Structure `src/modules/ai/` with subfolders from Phase 0 skeleton:

```text
gateway/ providers/ health/ prompts/ token/
fallback/ queue/ matching/
```

All AI calls route through `gateway/`. Business modules never import provider SDKs.

Fallback order: Gemini → OpenRouter → Groq → Z.AI → Ollama.

## Consequences

- **Positive:** Phase 7 implementation without large refactor  
- **Negative:** More folders upfront (mostly README until Phase 7)  
- **Neutral:** Graceful degradation policy unchanged  

See `.cto/AI_RULES.md` and `docs/rfc/ai-matching.md`.
