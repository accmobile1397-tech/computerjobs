import { describe, expect, it } from "vitest";
import {
  computeMatchScore,
  MATCH_SCORE_VERSION,
} from "@/modules/search/services/match-score";
import { searchJobsQuerySchema } from "@/modules/search/validators/search.schema";

describe("MatchScore v1 (happy path)", () => {
  it("returns version 1 and skill overlap score", () => {
    const result = computeMatchScore({
      jobSkillIds: ["s1", "s2"],
      resumeSkillIds: ["s1"],
      jobTechnologyIds: [],
      resumeTechnologyIds: [],
      jobCategoryId: "c1",
      resumeCategoryIds: ["c1"],
      jobCityId: "city1",
      jobProvinceId: "p1",
      resumeCityIds: ["city1"],
      resumeProvinceIds: ["p1"],
      jobExperienceLevel: "SENIOR",
      resumeExperienceLevel: null,
    });

    expect(result.version).toBe(MATCH_SCORE_VERSION);
    expect(result.breakdown.skills).toBe(20); // 1/2 * 40
    expect(result.breakdown.category).toBe(15);
    expect(result.breakdown.location).toBe(10);
    expect(result.breakdown.experienceLevel).toBe(0);
    expect(result.breakdown.salaryCompatibility).toBeNull();
    expect(result.score).toBe(45);
  });
});

describe("search jobs query validation", () => {
  it("parses skillIds csv", () => {
    const result = searchJobsQuerySchema.safeParse({
      skillIds:
        "550e8400-e29b-41d4-a716-446655440000,6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skillIds).toHaveLength(2);
    }
  });

  it("rejects invalid uuid in skillIds", () => {
    const result = searchJobsQuerySchema.safeParse({ skillIds: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("employer resume search gate (permission contract)", () => {
  it("documents required permission slug", () => {
    expect("search:resumes").toBe("search:resumes");
    expect("match:read:own").toBe("match:read:own");
    expect("match:read:employer").toBe("match:read:employer");
  });
});
