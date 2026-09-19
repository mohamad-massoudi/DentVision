import { jwtVerify, SignJWT } from "jose";

export type Role = "dentist" | "staff" | "patient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: number;
}

export interface SessionPayload {
  userId: string;
  role: Role;
}

export const SESSION_COOKIE = "dentvision_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const roleLabels: Record<Role, string> = {
  dentist: "پزشک",
  staff: "منشی / ادمین",
  patient: "بیمار",
};

export const rolePermissions: Record<Role, string[]> = {
  dentist: ["analysis", "patients", "records", "settings"],
  staff: ["patients", "upload"],
  patient: ["my-record", "reports"],
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ role: payload.role })
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
    if (!payload.sub || !isRole(payload.role)) return null;
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function isRole(value: unknown): value is Role {
  return value === "dentist" || value === "staff" || value === "patient";
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
