import type {
  AiProvider,
  ProviderCompleteInput,
  ProviderCompleteResult,
} from "@/modules/ai/types/ai.types";
import { AiError } from "@/modules/ai/types/ai.types";

/** Google Gemini generateContent via HTTP — no SDK outside providers/. */
export const geminiProvider: AiProvider = {
  name: "gemini",
  async complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new AiError("AI_UNAVAILABLE");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${input.systemPrompt}\n\n---\n\n${input.userContent}`,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new AiError("AI_UNAVAILABLE");
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = json.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!text) throw new AiError("AI_UNAVAILABLE");
      return { provider: "gemini", model: input.model, text };
    } catch (e) {
      if (e instanceof AiError) throw e;
      throw new AiError("AI_UNAVAILABLE");
    } finally {
      clearTimeout(timer);
    }
  },
};
