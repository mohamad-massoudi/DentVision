import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  try {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const preference = await prisma.userNotificationPreference.findUnique({ where: { userId: user.id } });
  const generatedAt = new Date();
  const enabled = preference?.enabled ?? true;
  const response = { enabled, generatedAt: generatedAt.toISOString(), unreadCount: 0, notifications: [] as Array<{ id: string; title: string; createdAt: string; unread: boolean; href: string }> };
  if (!enabled) return NextResponse.json(response, { headers: { "Cache-Control": "private, no-store" } });
  const scope = user.role === "SUPER_ADMIN" ? {} : user.role === "PATIENT" ? { userId: user.id } : { clinicId: user.clinicId ?? "__no_clinic__" };
  const since = preference?.lastReadAt ?? new Date(0);
  const [reports, images, unreadReports, unreadImages] = await Promise.all([
    prisma.medicalReport.findMany({ where: { patient: scope, createdAt: { lte: generatedAt } }, select: { id: true, patientId: true, createdAt: true, patient: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.xRayImage.findMany({ where: { patient: scope, uploadedAt: { lte: generatedAt } }, select: { id: true, uploadedAt: true, patient: { select: { fullName: true } } }, orderBy: { uploadedAt: "desc" }, take: 30 }),
    prisma.medicalReport.count({ where: { patient: scope, createdAt: { gt: since, lte: generatedAt } } }),
    prisma.xRayImage.count({ where: { patient: scope, uploadedAt: { gt: since, lte: generatedAt } } }),
  ]);
  response.unreadCount = unreadReports + unreadImages;
  response.notifications = [
    ...reports.map(report => ({ id: `report:${report.id}`, title: `گزارش درمان جدید برای ${report.patient.fullName}`, createdAt: report.createdAt.toISOString(), unread: report.createdAt > since, href: user.role === "PATIENT" || user.role === "DENTIST" || user.role === "SUPER_ADMIN" ? `/patients/${report.patientId}/reports/${report.id}/print` : "/" })),
    ...images.map(image => ({ id: `image:${image.id}`, title: `تصویر جدید در پرونده ${image.patient.fullName}`, createdAt: image.uploadedAt.toISOString(), unread: image.uploadedAt > since, href: "/" })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
  return NextResponse.json(response, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "دریافت اعلان‌ها ناموفق بود." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || (body.enabled !== undefined && typeof body.enabled !== "boolean") || (body.readThrough !== undefined && typeof body.readThrough !== "string")) return NextResponse.json({ message: "تنظیمات اعلان معتبر نیست." }, { status: 400 });
  const readThrough = body.readThrough === undefined ? undefined : new Date(body.readThrough);
  if (readThrough && (!Number.isFinite(readThrough.getTime()) || readThrough.getTime() > Date.now())) return NextResponse.json({ message: "زمان خواندن اعلان معتبر نیست." }, { status: 400 });
  try {
    await prisma.$transaction(async tx => {
      const existing = await tx.userNotificationPreference.findUnique({ where: { userId: user.id } });
      const lastReadAt = readThrough && (!existing?.lastReadAt || readThrough > existing.lastReadAt) ? readThrough : existing?.lastReadAt;
      await tx.userNotificationPreference.upsert({ where: { userId: user.id }, create: { userId: user.id, enabled: body.enabled ?? true, lastReadAt }, update: { ...(body.enabled !== undefined ? { enabled: body.enabled } : {}), lastReadAt } });
    });
    return NextResponse.json({ message: "تنظیمات اعلان ذخیره شد." });
  } catch { return NextResponse.json({ message: "ذخیره تنظیمات اعلان ناموفق بود." }, { status: 500 }); }
}
