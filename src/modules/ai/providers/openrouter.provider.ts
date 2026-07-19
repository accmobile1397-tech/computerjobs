import type {
  AiProvider,
  ProviderCompleteInput,
  ProviderCompleteResult,
} from "@/modules/ai/types/ai.types";
import { AiError } from "@/modules/ai/types/ai.types";

/** OpenRouter via HTTP — no SDK import outside providers/. */
export const openrouterProvider: AiProvider = {
  name: "openrouter",
  async complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new AiError("AI_UNAVAILABLE");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
          "X-Title": "ComputerJobs",
        },
        body: JSON.stringify({
          model: input.model,
          messages: [
            { role: "system", content: input.systemPrompt },
            { role: "user", content: input.userContent },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new AiError("AI_UNAVAILABLE");
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new AiError("AI_UNAVAILABLE");
      return { provider: "openrouter", model: input.model, text };
    } catch (e) {
      if (e instanceof AiError) throw e;
      throw new AiError("AI_UNAVAILABLE");
    } finally {
      clearTimeout(timer);
    }
  },
};
