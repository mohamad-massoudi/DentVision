import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole, isSameOrigin } from "@/lib/serverAuth";
import { patientForResponse } from "@/lib/patientResponse";

const managementRoles = ["DENTIST", "STAFF"] as const;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const requestedClinicId = request.nextUrl.searchParams.get("clinicId")?.trim();
  const scope =
    user.role === "SUPER_ADMIN"
      ? requestedClinicId
        ? { clinicId: requestedClinicId }
        : {}
      : user.role === "PATIENT"
        ? { userId: user.id }
        : user.clinicId
          ? { clinicId: user.clinicId }
          : null;

  if (!scope) {
    return NextResponse.json({ message: "کاربر به کلینیکی متصل نیست." }, { status: 403 });
  }

  const patients = await prisma.patient.findMany({
    where: {
      ...scope,
      ...(search
        ? {
          OR: [
            { fullName: { contains: search } },
            { fileNumber: { contains: search } },
            { phone: { contains: search } },
            { nationalId: { contains: search } },
          ],
        }
        : {}),
    },
    include: { images: { orderBy: { uploadedAt: "desc" } }, reports: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ patients: patients.map(patientForResponse) });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  }
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  if (!hasRole(user.role, [...managementRoles])) {
    return NextResponse.json({ message: "اجازه ثبت بیمار را ندارید." }, { status: 403 });
  }
  if (!user.clinicId) {
    return NextResponse.json({ message: "حساب شما به کلینیکی متصل نیست." }, { status: 403 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    nationalId?: string;
    fileNumber?: string;
    age?: number;
    phone?: string;
    status?: string;
    medicalHistory?: string;
    username?: string;
    patientPassword?: string;
  };
  const fullName = body.fullName?.trim();
  const nationalId = body.nationalId?.trim();
  const fileNumber = body.fileNumber?.trim();
  const phone = body.phone?.trim();
  const status = body.status?.trim();

  if (!fullName || !nationalId || !fileNumber || !phone || !status || !Number.isInteger(body.age) || body.age! < 1 || body.age! > 120) {
    return NextResponse.json({ message: "اطلاعات بیمار کامل یا معتبر نیست." }, { status: 400 });
  }
  const duplicate = await prisma.patient.findFirst({
    where: {
      clinicId: user.clinicId,
      OR: [{ fileNumber }, { nationalId }],
    },
  });
  if (duplicate) {
    return NextResponse.json({ message: "شماره پرونده یا کد ملی در این کلینیک تکراری است." }, { status: 409 });
  }

  if ((body.username && !body.patientPassword) || (!body.username && body.patientPassword)) {
    return NextResponse.json({ message: "نام کاربری و رمز بیمار باید باهم وارد شوند." }, { status: 400 });
  }

  if (body.patientPassword && body.patientPassword.length < 8) {
    return NextResponse.json({ message: "رمز بیمار باید حداقل ۸ کاراکتر باشد." }, { status: 400 });
  }

  if (body.username) {
    const username = body.username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,50}$/.test(username)) return NextResponse.json({ message: "نام کاربری باید ۳ تا ۵۰ نویسه انگلیسی باشد." }, { status: 400 });
    if (await prisma.user.findUnique({ where: { username } })) return NextResponse.json({ message: "نام کاربری بیمار تکراری است." }, { status: 409 });
  }

  const patient = await prisma.$transaction(async (tx) => {
    const patientUser = body.username
      ? await tx.user.create({
          data: {
            username: body.username.trim().toLowerCase(),
            password: await (await import("bcryptjs")).default.hash(body.patientPassword!, 10),
            name: fullName,
            phone,
            role: "PATIENT",
            clinicId: user.clinicId,
            creatorId: user.id,
          },
        })
      : null;

    return tx.patient.create({
      data: {
        fullName,
        nationalId,
        fileNumber,
        age: body.age!,
        phone,
        status,
        medicalHistory: body.medicalHistory?.trim() || null,
        clinicId: user.clinicId!,
        creatorId: user.id,
        userId: patientUser?.id,
      },
      include: { images: true },
    });
  });
  return NextResponse.json({ patient: patientForResponse(patient) }, { status: 201 });
}
