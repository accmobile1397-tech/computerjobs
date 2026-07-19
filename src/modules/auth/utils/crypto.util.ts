import { createHash, randomBytes } from "crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const MOBILE_REGEX = /^(\+98|0)?9\d{9}$/;

export function detectIdentifierType(
  identifier: string,
): "EMAIL" | "MOBILE" | "INVALID" {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return "EMAIL";
  const digits = trimmed.replace(/[\s-]/g, "");
  if (MOBILE_REGEX.test(digits)) return "MOBILE";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "EMAIL";
  return "INVALID";
}

export function normalizeMobile(mobile: string): string {
  let digits = mobile.replace(/[\s-]/g, "");
  if (digits.startsWith("0")) digits = `+98${digits.slice(1)}`;
  if (digits.startsWith("98") && !digits.startsWith("+"))
    digits = `+${digits}`;
  if (!digits.startsWith("+98")) digits = `+98${digits}`;
  return digits;
}
