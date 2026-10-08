import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessiblePatient, getCurrentUser, isSameOrigin } from "@/lib/serverAuth";
import { patientForResponse } from "@/lib/patientResponse";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!await getCurrentUser(request)) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const { id } = await context.params;
  const patient = await getAccessiblePatient(request, id);
  if (!patient) return NextResponse.json({ message: "پرونده پیدا نشد." }, { status: 404 });
  return NextResponse.json({ patient: patientForResponse(patient) });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const user = await getCurrentUser(request);
  if (!user || !["DENTIST", "STAFF"].includes(user.role)) return NextResponse.json({ message: "دسترسی مجاز نیست." }, { status: 403 });
  if (!user.clinicId) return NextResponse.json({ message: "حساب شما به کلینیکی متصل نیست." }, { status: 403 });
  const { id } = await context.params;
  const patient = await getAccessiblePatient(request, id);
  if (!patient) return NextResponse.json({ message: "پرونده پیدا نشد." }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || Array.isArray(body) || typeof body !== "object") return NextResponse.json({ message: "اطلاعات ارسالی معتبر نیست." }, { status: 400 });
  for (const key of ["fullName", "phone", "status", "medicalHistory"]) {
    if (key in body && typeof body[key] !== "string") return NextResponse.json({ message: "نوع اطلاعات بیمار معتبر نیست." }, { status: 400 });
  }
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : patient.fullName;
  const phone = typeof body.phone === "string" ? body.phone.trim() : patient.phone;
  const status = typeof body.status === "string" ? body.status.trim() : patient.status;
  const age = body.age === undefined ? patient.age : body.age;
  const medicalHistory = typeof body.medicalHistory === "string" ? body.medicalHistory.trim() || null : patient.medicalHistory;
  if (!fullName || fullName.length > 150 || phone.length < 7 || phone.length > 20 || !status || status.length > 100 || (medicalHistory?.length ?? 0) > 50000 || typeof age !== "number" || !Number.isInteger(age) || age < 1 || age > 120)
    return NextResponse.json({ message: "اطلاعات بیمار معتبر نیست." }, { status: 400 });
  try {
    const updated = await prisma.patient.update({
      where: { id, clinicId: user.clinicId }, data: { fullName, phone, status, age, medicalHistory },
      include: { images: true, reports: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json({ patient: patientForResponse(updated) });
  } catch {
    return NextResponse.json({ message: "ویرایش پرونده انجام نشد؛ دوباره تلاش کنید." }, { status: 500 });
  }
}
