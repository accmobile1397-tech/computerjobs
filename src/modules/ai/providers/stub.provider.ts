import type {
  AiProvider,
  ProviderCompleteInput,
  ProviderCompleteResult,
} from "@/modules/ai/types/ai.types";

export const stubProvider: AiProvider = {
  name: "stub",
  async complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    const preview = input.userContent.slice(0, 120).replace(/\s+/g, " ");
    return {
      provider: "stub",
      model: input.model,
      text: `[stub:${input.model}] ${preview}`,
    };
  },
  async moderate() {
    return { allowed: true };
  },
};
