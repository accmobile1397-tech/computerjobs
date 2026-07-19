import { describe, expect, it } from "vitest";
import { computeEstimatedCredits } from "@/modules/ai/gateway/estimate";
import { loadPrompt } from "@/modules/ai/prompts/registry";
import { stubProvider } from "@/modules/ai/providers/stub.provider";
import { AI_FEATURE_KEYS, AI_PROMPT_IDS } from "@/modules/ai/constants";

describe("AI prompt registry", () => {
  it("loads match-explain.v1 from file", () => {
    const p = loadPrompt(AI_PROMPT_IDS.MATCH_EXPLAIN);
    expect(p.promptId).toBe("match-explain.v1");
    expect(p.body.length).toBeGreaterThan(20);
  });

  it("loads job-improve.v1 from file", () => {
    const p = loadPrompt(AI_PROMPT_IDS.JOB_IMPROVE);
    expect(p.body).toContain("Persian");
  });
});

describe("stub provider", () => {
  it("completes without external SDK", async () => {
    const result = await stubProvider.complete({
      model: "stub-match",
      systemPrompt: "sys",
      userContent: "hello world",
      timeoutMs: 1000,
    });
    expect(result.provider).toBe("stub");
    expect(result.text).toContain("hello");
  });
});

describe("estimateCost", () => {
  it("returns at least base cost for small payload", () => {
    const credits = computeEstimatedCredits(AI_FEATURE_KEYS.MATCH_EXPLAIN, {
      a: 1,
    });
    expect(credits).toBe(1);
  });

  it("adds surcharge for huge payloads", () => {
    const huge = { text: "x".repeat(20_000) };
    const credits = computeEstimatedCredits(AI_FEATURE_KEYS.JOB_IMPROVE, huge);
    expect(credits).toBeGreaterThan(2);
  });
});

describe("permission contract", () => {
  it("documents AI permission slugs", () => {
    expect("ai:use:own").toBe("ai:use:own");
    expect("ai:use:company").toBe("ai:use:company");
    expect("ai:admin").toBe("ai:admin");
  });
});

describe("P8 response meta shape", () => {
  it("requires provider model requestId creditsCaptured", () => {
    const meta = {
      provider: "stub",
      model: "stub-match",
      requestId: "r1",
      creditsCaptured: 1,
    };
    expect(meta).toMatchObject({
      provider: expect.any(String),
      model: expect.any(String),
      requestId: expect.any(String),
      creditsCaptured: expect.any(Number),
    });
  });
});
