import { describe, expect, it } from "vitest";
import { JobStatus, ApplicationStatus, SalaryType } from "@prisma/client";

describe("Phase 4 enums (CTO conditions)", () => {
  it("includes PENDING_REVIEW job status", () => {
    expect(JobStatus.PENDING_REVIEW).toBe("PENDING_REVIEW");
  });

  it("includes VIEWED application status", () => {
    expect(ApplicationStatus.VIEWED).toBe("VIEWED");
  });

  it("includes salary types", () => {
    expect(SalaryType.MONTHLY).toBe("MONTHLY");
    expect(SalaryType.PROJECT).toBe("PROJECT");
  });
});
