import { describe, expect, it } from "vitest";
import {
  detectIdentifierType,
  normalizeEmail,
  normalizeMobile,
} from "@/modules/auth/utils/crypto.util";

describe("login identifier", () => {
  it("detects email", () => {
    expect(detectIdentifierType("user@example.com")).toBe("EMAIL");
  });

  it("detects mobile", () => {
    expect(detectIdentifierType("09121234567")).toBe("MOBILE");
  });

  it("normalizes email", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("normalizes mobile to +98", () => {
    expect(normalizeMobile("09121234567")).toBe("+989121234567");
  });
});
