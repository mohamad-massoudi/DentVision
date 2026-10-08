import { NextResponse, type NextRequest } from "next/server";
import { getAccessiblePatient, getCurrentUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; reportId: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  if (!["DENTIST", "PATIENT", "SUPER_ADMIN"].includes(user.role)) return NextResponse.json({ message: "دسترسی به خروجی گزارش مجاز نیست." }, { status: 403 });
  const { id, reportId } = await context.params;
  const patient = await getAccessiblePatient(request, id);
  if (!patient) return NextResponse.json({ message: "پرونده پیدا نشد." }, { status: 404 });
  // Both identifiers are required: a report from another patient cannot be substituted.
  const report = await prisma.medicalReport.findFirst({ where: { id: reportId, patientId: patient.id }, select: { id: true, content: true, createdAt: true, author: { select: { name: true, phone: true } } } });
  if (!report) return NextResponse.json({ message: "گزارش پیدا نشد." }, { status: 404 });
  const clinic = await prisma.clinic.findUnique({ where: { id: patient.clinicId }, select: { name: true, address: true, phone: true } });
  if (!clinic) return NextResponse.json({ message: "کلینیک پیدا نشد." }, { status: 404 });
  return NextResponse.json({
    clinic, report,
    patient: { id: patient.id, fullName: patient.fullName, age: patient.age, phone: patient.phone, status: patient.status, nationalId: patient.nationalId, fileNumber: patient.fileNumber },
    images: patient.images.map(image => ({ id: image.id, url: `/api/images/${image.id}`, fileName: image.fileName, fileSize: image.fileSize, mimeType: image.mimeType, uploadedAt: image.uploadedAt })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
