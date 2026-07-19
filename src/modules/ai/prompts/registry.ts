import { readFileSync } from "fs";
import { join } from "path";
import { AiError } from "@/modules/ai/types/ai.types";

const CACHE = new Map<string, string>();

const PROMPT_FILES: Record<string, string> = {
  "match-explain.v1": "match-explain.v1.md",
  "job-improve.v1": "job-improve.v1.md",
};

/** Load versioned prompt from registry — never inline prompts in services. */
export function loadPrompt(promptId: string): { promptId: string; body: string } {
  const file = PROMPT_FILES[promptId];
  if (!file) throw new AiError("VALIDATION_ERROR");

  const cached = CACHE.get(promptId);
  if (cached) return { promptId, body: cached };

  const path = join(process.cwd(), "src/modules/ai/prompts", file);
  const body = readFileSync(path, "utf8").trim();
  CACHE.set(promptId, body);
  return { promptId, body };
}
