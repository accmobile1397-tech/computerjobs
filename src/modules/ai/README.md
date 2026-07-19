# AI Module

All AI access goes through **`gateway/`**. Feature modules must never import provider SDKs.

## Phase 8

| Path | Purpose |
|------|---------|
| `gateway/` | `complete` · `embed` · `moderate` + estimate/routing/rate-limit |
| `providers/` | `stub` · `openrouter` · `gemini` (HTTP adapters) |
| `prompts/` | Versioned prompt registry (`*.v1.md`) |
| `matching/` | `ai.match.explain` |
| `jobs/` | `ai.job.improve_description` |

**Out of scope:** Resume AI Suggest (Phase 8.1) · local provider (TD-P8-1)

See [RFC-002](../../../docs/rfc/RFC-002-AI-ARCHITECTURE.md).
