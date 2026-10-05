import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken, type Role } from "@/lib/auth";

export async function getSessionPayload(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser(request: NextRequest) {
  const payload = await getSessionPayload(request);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      phone: true,
      clinicId: true,
      clinic: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function hasRole(role: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(role);
}

export function canAccessClinic(
  user: { role: Role; clinicId: string | null },
  clinicId: string,
) {
  return user.role === "SUPER_ADMIN" || user.clinicId === clinicId;
}

export async function getAccessiblePatient(request: NextRequest, patientId: string) {
  const user = await getCurrentUser(request);
  if (!user) return null;

  const patient = await prisma.patient.findFirst({
    where:
      user.role === "SUPER_ADMIN"
        ? { id: patientId }
        : user.role === "PATIENT"
          ? { id: patientId, userId: user.id }
          : { id: patientId, clinicId: user.clinicId ?? "__no_clinic__" },
    include: { images: { orderBy: { uploadedAt: "desc" } }, reports: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
  });

  return patient;
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === request.nextUrl.origin;
}
