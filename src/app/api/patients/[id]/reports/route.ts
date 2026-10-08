import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessiblePatient, getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const { id } = await context.params;
  const patient = await getAccessiblePatient(request, id);
  if (!patient) return NextResponse.json({ message: "پرونده پیدا نشد." }, { status: 404 });
  const reports = await prisma.medicalReport.findMany({ where: { patientId: id }, include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const user = await getCurrentUser(request);
  if (!user || user.role !== "DENTIST") return NextResponse.json({ message: "فقط پزشک می‌تواند گزارش درمانی ثبت کند." }, { status: 403 });
  const { id } = await context.params;
  const patient = await getAccessiblePatient(request, id);
  if (!patient) return NextResponse.json({ message: "پرونده پیدا نشد." }, { status: 404 });
  const { content } = await request.json() as { content?: string };
  const cleaned = typeof content === "string" ? content.trim() : "";
  if (!cleaned || cleaned.length > 50000) return NextResponse.json({ message: "متن گزارش باید بین ۱ تا ۵۰۰۰۰ نویسه باشد." }, { status: 400 });
  const report = await prisma.$transaction(async tx => {
    const saved = await tx.medicalReport.create({ data: { content: cleaned, patientId: id, authorId: user.id }, include: { author: { select: { name: true } } } });
    await tx.patient.update({ where: { id }, data: { medicalHistory: cleaned } });
    return saved;
  });
  return NextResponse.json({ report }, { status: 201 });
}
