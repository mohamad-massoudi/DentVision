import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ message: "دسترسی مجاز نیست." }, { status: 403 });
  const clinics = await prisma.clinic.findMany({
    include: { _count: { select: { users: true, patients: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ clinics });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const user = await getCurrentUser(request);
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ message: "فقط مدیر کل می‌تواند کلینیک بسازد." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const dentistName = typeof body.dentistName === "string" ? body.dentistName.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() || null : null;
  const password = body.password;
  if (!name || !address || !phone || !dentistName || !/^[a-z0-9._-]{3,50}$/.test(username) ||
      typeof password !== "string" || password.length < 8)
    return NextResponse.json({ message: "اطلاعات کلینیک و حساب پزشک را کامل و معتبر وارد کنید." }, { status: 400 });
  const duplicate = await prisma.user.findFirst({ where: { OR: [{ username }, ...(email ? [{ email }] : [])] } });
  if (duplicate) return NextResponse.json({ message: "نام کاربری یا ایمیل تکراری است." }, { status: 409 });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const clinic = await prisma.$transaction(async tx => {
      const created = await tx.clinic.create({ data: { name, address, phone } });
      await tx.user.create({ data: { username, email, password: hashed, name: dentistName, role: "DENTIST", clinicId: created.id, creatorId: user.id } });
      return created;
    });
    return NextResponse.json({ clinic }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ message: "نام کاربری یا ایمیل تکراری است." }, { status: 409 });
    throw error;
  }
}
