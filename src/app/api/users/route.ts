import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const actor = await getCurrentUser(request);
  if (!actor || !["SUPER_ADMIN", "DENTIST"].includes(actor.role))
    return NextResponse.json({ message: "دسترسی مجاز نیست." }, { status: 403 });
  const users = await prisma.user.findMany({
    where: actor.role === "SUPER_ADMIN" ? {} : { clinicId: actor.clinicId ?? "" },
    select: { id: true, username: true, name: true, role: true, clinic: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const actor = await getCurrentUser(request);
  if (!actor || !["SUPER_ADMIN", "DENTIST"].includes(actor.role))
    return NextResponse.json({ message: "دسترسی مجاز نیست." }, { status: 403 });
  const body = await request.json() as Record<string, unknown>;
  const role = body.role;
  const clinicId = actor.role === "SUPER_ADMIN" ? body.clinicId : actor.clinicId;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() || null : null;
  const password = body.password;
  if ((role !== "DENTIST" && role !== "STAFF") || (actor.role === "DENTIST" && role !== "STAFF") ||
      typeof clinicId !== "string" || !clinicId || !name || !/^[a-z0-9._-]{3,50}$/.test(username) ||
      typeof password !== "string" || password.length < 8)
    return NextResponse.json({ message: "نام، نام کاربری، نقش، کلینیک و رمز عبور معتبر لازم است." }, { status: 400 });
  if (!await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true } }))
    return NextResponse.json({ message: "کلینیک پیدا نشد." }, { status: 404 });
  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, ...(email ? [{ email }] : [])] } });
  if (existing) return NextResponse.json({ message: "نام کاربری یا ایمیل تکراری است." }, { status: 409 });
  try {
    const created = await prisma.user.create({
      data: { username, email, password: await bcrypt.hash(password, 10), name,
        phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
        role, clinicId, creatorId: actor.id },
      select: { id: true, username: true, email: true, name: true, role: true, clinicId: true },
    });
    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ message: "نام کاربری یا ایمیل تکراری است." }, { status: 409 });
    throw error;
  }
}
