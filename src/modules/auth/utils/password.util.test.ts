import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/auth/utils/password.util";

describe("password", () => {
  it("hashes and verifies with argon2", async () => {
    const hash = await hashPassword("SecurePass123!");
    expect(hash).not.toBe("SecurePass123!");
    expect(await verifyPassword("SecurePass123!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
