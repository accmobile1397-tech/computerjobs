# AI Rules

## AI Is Enhancement

Platform **must** run when all AI providers fail.

## Gateway Only

All AI through `src/modules/ai/` — see folder structure in [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md).

**Forbidden:** direct OpenAI/Gemini SDK in business modules or pages.

## Providers (no lock-in)

Gemini, OpenRouter, Groq, Z.AI, Ollama, future providers.

## Fallback Order

Gemini → OpenRouter → Groq → Z.AI → Ollama

## Graceful Degradation

| May fail | Must not fail |
|----------|----------------|
| AI Chat | Login, Registration |
| AI Matching | Resume Builder |
| AI Suggestions | Job Posting, Payments, Search |

User message when AI down: «سرویس AI موقتاً در دسترس نیست»

## Governance

- Taxonomy suggestions: AI → pending → admin approval  
- Token/cost tracking in `ai/token/`  

See [docs/adr/0003-ai-gateway.md](../docs/adr/0003-ai-gateway.md) and [docs/rfc/ai-matching.md](../docs/rfc/ai-matching.md).
