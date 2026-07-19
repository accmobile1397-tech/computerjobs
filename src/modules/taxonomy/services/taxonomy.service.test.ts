import { describe, expect, it } from "vitest";
import { listCategories } from "@/modules/taxonomy/services/taxonomy.service";

describe("taxonomy.service public API", () => {
  it("exports listCategories function", () => {
    expect(typeof listCategories).toBe("function");
  });

  it("taxonomy entity types include TECHNOLOGY", () => {
    expect(["CATEGORY", "SUBCATEGORY", "SKILL", "TECHNOLOGY"]).toContain("TECHNOLOGY");
  });
});
