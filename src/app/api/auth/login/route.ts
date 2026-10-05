import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  }
  const body = (await request.json()) as {
    identifier?: string;
    password?: string;
  };

  const identifier = body.identifier?.trim().toLowerCase();
  if (!identifier || !body.password) {
    return NextResponse.json({ message: "نام کاربری/ایمیل و رمز عبور الزامی است." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });
  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    return NextResponse.json({ message: "نام کاربری/ایمیل یا رمز عبور اشتباه است." }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, role: user.role });
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
