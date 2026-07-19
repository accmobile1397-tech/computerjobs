# AI Module

All AI access goes through this module. Direct provider SDK usage elsewhere is forbidden.

## Structure

| Folder | Purpose |
|--------|---------|
| [gateway](./gateway/) | Provider abstraction, routing |
| [providers](./providers/) | Gemini, OpenRouter, Groq, Z.AI, Ollama |
| [health](./health/) | Provider health monitoring |
| [prompts](./prompts/) | Prompt templates & versioning |
| [token](./token/) | Token tracking & cost |
| [fallback](./fallback/) | Fallback chain logic |
| [queue](./queue/) | Async AI jobs (BullMQ) |
| [matching](./matching/) | AI job/resume matching |

**Phase:** 7–8 — skeleton from Phase 0 refactor.

See `docs/adr/0003-ai-gateway.md` and `docs/rfc/ai-matching.md`.
