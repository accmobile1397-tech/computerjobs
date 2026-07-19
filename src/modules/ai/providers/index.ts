import { getSetting } from "@/modules/billing/services/billing-core";
import { SETTING_KEYS } from "@/modules/billing/constants";
import type { AiProvider } from "@/modules/ai/types/ai.types";
import { AiError } from "@/modules/ai/types/ai.types";
import { stubProvider } from "@/modules/ai/providers/stub.provider";
import { openrouterProvider } from "@/modules/ai/providers/openrouter.provider";
import { geminiProvider } from "@/modules/ai/providers/gemini.provider";

const REGISTRY: Record<string, AiProvider> = {
  stub: stubProvider,
  openrouter: openrouterProvider,
  gemini: geminiProvider,
};

export async function resolveProviderChain(): Promise<AiProvider[]> {
  const active = await getSetting(SETTING_KEYS.ACTIVE_AI_PROVIDER, "stub");
  const fallback = await getSetting<string[]>(SETTING_KEYS.AI_FALLBACK_PROVIDERS, [
    "stub",
  ]);
  const names = [active, ...fallback.filter((n) => n !== active)];
  const providers: AiProvider[] = [];
  for (const name of names) {
    const p = REGISTRY[name];
    if (p) providers.push(p);
  }
  if (providers.length === 0) throw new AiError("AI_UNAVAILABLE");
  return providers;
}

export function getProviderByName(name: string): AiProvider | undefined {
  return REGISTRY[name];
}
