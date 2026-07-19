import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  primaryType: string;
  roles: string[];
  permissions: string[];
}

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
): Promise<string> {
  const ttl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload as AccessTokenPayload;
}

export async function signRefreshToken(userId: string): Promise<string> {
  const ttl = Number(process.env.JWT_REFRESH_TTL ?? 604800);
  return new SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(getRefreshSecret());
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getRefreshSecret());
  if (payload.type !== "refresh" || !payload.sub) {
    throw new Error("Invalid refresh token");
  }
  return { sub: payload.sub as string };
}

export function getAccessTokenTtlSeconds(): number {
  return Number(process.env.JWT_ACCESS_TTL ?? 900);
}
