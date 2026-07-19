import { getSetting } from "@/modules/billing/services/billing-core";
import { SETTING_KEYS } from "@/modules/billing/constants";
import type { AiProvider } from "@/modules/ai/types/ai.types";
import { AiError } from "@/modules/ai/types/ai.types";

/** Mandatory safety gate before provider calls. */
export async function moderate(
  text: string,
  provider?: AiProvider,
): Promise<void> {
  const blockedPatterns = [/\b(ssn|cvv)\b/i, /<script/i];
  if (blockedPatterns.some((re) => re.test(text))) {
    throw new AiError("MODERATION_BLOCKED");
  }

  if (provider?.moderate) {
    try {
      const result = await provider.moderate(text);
      if (!result.allowed) throw new AiError("MODERATION_BLOCKED");
    } catch (e) {
      if (e instanceof AiError) throw e;
      const failOpen = await getSetting(SETTING_KEYS.AI_MODERATION_FAIL_OPEN, true);
      if (!failOpen) throw new AiError("MODERATION_BLOCKED");
    }
  }
}
