import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const SECRET = process.env.AUTH_SECRET ?? "dev-secret-postflow";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const computed = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
}

export function createSessionToken(payload: Record<string, string>) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${createHash("sha256").update(`${value}:${SECRET}`).digest("hex")}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;
  const expected = createHash("sha256").update(`${payloadPart}:${SECRET}`).digest("hex");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return decoded;
  } catch {
    return null;
  }
}

export function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.split(";").find((entry) => entry.trim().startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}
