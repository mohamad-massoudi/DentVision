import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRole, isSameOrigin } from "@/lib/serverAuth";

const allowedRoles = ["dentist", "staff"] as const;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  if (!hasRole(user.role, [...allowedRoles])) {
    return NextResponse.json({ message: "دسترسی به فهرست بیماران مجاز نیست." }, { status: 403 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const patients = await prisma.patient.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search } },
            { fileNumber: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ patients });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  }
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  if (!hasRole(user.role, [...allowedRoles])) {
    return NextResponse.json({ message: "اجازه ثبت بیمار را ندارید." }, { status: 403 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    fileNumber?: string;
    age?: number;
    phone?: string;
    status?: string;
    medicalHistory?: string;
  };
  const fullName = body.fullName?.trim();
  const fileNumber = body.fileNumber?.trim();
  const phone = body.phone?.trim();
  const status = body.status?.trim();

  if (!fullName || !fileNumber || !phone || !status || !Number.isInteger(body.age) || body.age! < 1 || body.age! > 120) {
    return NextResponse.json({ message: "اطلاعات بیمار کامل یا معتبر نیست." }, { status: 400 });
  }
  const duplicate = await prisma.patient.findUnique({ where: { fileNumber } });
  if (duplicate) {
    return NextResponse.json({ message: "این شماره پرونده قبلاً ثبت شده است." }, { status: 409 });
  }

  const patient = await prisma.patient.create({
    data: {
      fullName,
      fileNumber,
      age: body.age!,
      phone,
      status,
      medicalHistory: body.medicalHistory?.trim() || null,
      creatorId: user.id,
    },
  });
  return NextResponse.json({ patient }, { status: 201 });
}
