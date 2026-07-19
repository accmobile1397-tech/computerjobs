import { getSetting } from "@/modules/billing/services/billing-core";
import { SETTING_KEYS } from "@/modules/billing/constants";

export async function resolveModel(featureKey: string): Promise<string> {
  const routing = await getSetting<Record<string, string>>(
    SETTING_KEYS.AI_MODEL_ROUTING,
    {},
  );
  if (routing[featureKey]) return routing[featureKey];
  return getSetting(SETTING_KEYS.AI_MODEL_ROUTING_DEFAULT, "stub-default");
}
