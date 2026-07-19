import { describe, expect, it } from "vitest";
import { ResumeStatus, ResumeVisibility } from "@prisma/client";
import {
  educationSchema,
  replaceSkillsSchema,
  replaceTechnologiesSchema,
} from "@/modules/resumes/validators/resume.schema";

describe("Phase 5 resume enums (CTO conditions)", () => {
  it("includes DRAFT and ACTIVE status", () => {
    expect(ResumeStatus.DRAFT).toBe("DRAFT");
    expect(ResumeStatus.ACTIVE).toBe("ACTIVE");
  });

  it("includes visibility values", () => {
    expect(ResumeVisibility.PRIVATE).toBe("PRIVATE");
    expect(ResumeVisibility.PUBLIC).toBe("PUBLIC");
  });
});

describe("resume validators", () => {
  it("rejects duplicate skillId (unique per resume)", () => {
    const result = replaceSkillsSchema.safeParse({
      skills: [
        { skillId: "11111111-1111-1111-1111-111111111111" },
        { skillId: "11111111-1111-1111-1111-111111111111" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate technologyId", () => {
    const result = replaceTechnologiesSchema.safeParse({
      technologies: [
        { technologyId: "22222222-2222-2222-2222-222222222222" },
        { technologyId: "22222222-2222-2222-2222-222222222222" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid education happy path", () => {
    const result = educationSchema.safeParse({
      institution: "University of Tehran",
      startDate: "2020-01-01",
      isCurrent: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date range", () => {
    const result = educationSchema.safeParse({
      institution: "U",
      startDate: "2022-01-01",
      endDate: "2020-01-01",
      isCurrent: false,
    });
    expect(result.success).toBe(false);
  });
});
