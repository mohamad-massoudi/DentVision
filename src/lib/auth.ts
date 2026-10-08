import { base64url, jwtVerify, SignJWT } from "jose";

export type Role = "SUPER_ADMIN" | "DENTIST" | "STAFF" | "PATIENT";

export interface AuthUser {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  role: Role;
  phone: string;
  clinicId: string | null;
  clinic: { id: string; name: string } | null;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: number;
}

export interface SessionPayload {
  userId: string;
  role: Role;
  credentialTag: string;
}

export const SESSION_COOKIE = "dentvision_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "ادمین کل سیستم",
  DENTIST: "پزشک",
  STAFF: "منشی / ادمین مطب",
  PATIENT: "بیمار",
};

export const rolePermissions: Record<Role, string[]> = {
  SUPER_ADMIN: ["clinics", "users", "settings", "notifications"],
  DENTIST: ["analysis", "patients", "records", "users", "settings", "notifications"],
  STAFF: ["patients", "upload", "settings", "notifications"],
  PATIENT: ["my-record", "reports", "settings", "notifications"],
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, credentialTag: payload.credentialTag })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (!payload.sub || !isRole(payload.role) || typeof payload.credentialTag !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(payload.credentialTag)) return null;
    return { userId: payload.sub, role: payload.role, credentialTag: payload.credentialTag };
  } catch {
    return null;
  }
}

// Keyed digest binds a session to the current password hash without exposing it.
async function credentialKey() {
  return crypto.subtle.importKey("raw", getSecret(), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createCredentialTag(passwordHash: string) {
  const signature = await crypto.subtle.sign("HMAC", await credentialKey(), new TextEncoder().encode(`dentvision-session:${passwordHash}`));
  return base64url.encode(new Uint8Array(signature));
}

export async function verifyCredentialTag(tag: string, passwordHash: string) {
  try {
    return await crypto.subtle.verify("HMAC", await credentialKey(), new Uint8Array(base64url.decode(tag)), new TextEncoder().encode(`dentvision-session:${passwordHash}`));
  } catch { return false; }
}

export function isRole(value: unknown): value is Role {
  return value === "SUPER_ADMIN" || value === "DENTIST" || value === "STAFF" || value === "PATIENT";
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
