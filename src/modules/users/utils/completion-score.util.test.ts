import { describe, expect, it } from "vitest";
import { ProfileVisibility } from "@prisma/client";
import { computeJobSeekerCompletionScore } from "@/modules/users/utils/completion-score.util";

describe("completion-score.util", () => {
  it("computes score from filled fields", () => {
    const score = computeJobSeekerCompletionScore(
      {
        displayName: "Ali",
        headline: "Dev",
        bio: "Bio",
        avatarUrl: "https://x.com/a.png",
        cityLabel: "Tehran",
        profileVisibility: ProfileVisibility.PUBLIC,
      },
      true,
    );
    expect(score).toBe(100);
  });

  it("returns partial score for incomplete profile", () => {
    const score = computeJobSeekerCompletionScore({ displayName: "Ali" }, false);
    expect(score).toBe(15);
  });
});
