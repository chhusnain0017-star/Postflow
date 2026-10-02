import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function getAuthSecret() {
  return process.env.AUTH_SECRET;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const computed = hash.length === 64
    ? createHash("sha256").update(`${salt}:${password}`).digest("hex")
    : scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(hash);
  const computedBuffer = Buffer.from(computed);
  return expectedBuffer.length === computedBuffer.length && timingSafeEqual(expectedBuffer, computedBuffer);
}

export function verifyInviteCode(code: string) {
  const configuredCode = process.env.ACCESS_REQUEST_CODE;
  if (!configuredCode || !code) return false;
  const providedDigest = createHash("sha256").update(code.trim()).digest();
  const configuredDigest = createHash("sha256").update(configuredCode.trim()).digest();
  return timingSafeEqual(providedDigest, configuredDigest);
}

export function verifySuperAdminCredentials(email: string, password: string) {
  const configuredEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!configuredEmail || !configuredPassword) return false;

  const emailBuffer = Buffer.from(email.trim().toLowerCase());
  const expectedEmailBuffer = Buffer.from(configuredEmail);
  const passwordBuffer = Buffer.from(password);
  const expectedPasswordBuffer = Buffer.from(configuredPassword);
  const emailMatches = emailBuffer.length === expectedEmailBuffer.length
    && timingSafeEqual(emailBuffer, expectedEmailBuffer);
  const passwordMatches = passwordBuffer.length === expectedPasswordBuffer.length
    && timingSafeEqual(passwordBuffer, expectedPasswordBuffer);
  return emailMatches && passwordMatches;
}

export function isConfiguredSuperAdminIdentity(email: string, role: string) {
  const configuredEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return role === "SYSTEM_ADMIN" && Boolean(configuredEmail) && email.trim().toLowerCase() === configuredEmail;
}

function getEncryptionKey() {
  const value = process.env.ENCRYPTION_KEY;
  if (!value || value.length < 32) {
    throw new Error("ENCRYPTION_KEY must contain at least 32 characters before provider credentials can be saved.");
  }
  return createHash("sha256").update(value).digest();
}

export function encryptProviderCredentials(clientId: string, clientSecret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({ clientId, clientSecret }), "utf8"), cipher.final()]);
  return `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptProviderCredentials(value: string) {
  const [version, ivHex, tagHex, encryptedHex] = value.split(":");
  if (version !== "v1" || !ivHex || !tagHex || !encryptedHex) {
    throw new Error("Stored provider credentials have an invalid format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as { clientId: string; clientSecret: string };
}

export function encryptOAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), "utf8"), cipher.final()]);
  return `tokens-v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptOAuthTokens(value: string) {
  const [version, ivHex, tagHex, encryptedHex] = value.split(":");
  if (version !== "tokens-v1" || !ivHex || !tagHex || !encryptedHex) {
    throw new Error("Stored OAuth tokens have an invalid format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as { accessToken: string; refreshToken?: string };
}

export function createSessionToken(payload: Record<string, string>) {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET must be configured before users can sign in.");
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${createHash("sha256").update(`${value}:${secret}`).digest("hex")}`;
}

export function verifySessionToken(token: string | undefined) {
  const secret = getAuthSecret();
  if (!token || !secret) return null;
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature || signature.length !== 64) return null;
  const expected = createHash("sha256").update(`${payloadPart}:${secret}`).digest("hex");
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
