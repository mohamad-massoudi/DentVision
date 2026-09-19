import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  isRole,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: unknown;
    invitationCode?: string;
  };
  const name = body.name?.trim();
  const email = body.email?.toLowerCase().trim();

  if (!name || !email?.includes("@") || !isRole(body.role)) {
    return NextResponse.json({ message: "اطلاعات ثبت‌نام معتبر نیست." }, { status: 400 });
  }
  if (body.role !== "patient" && (!process.env.STAFF_REGISTRATION_CODE || body.invitationCode !== process.env.STAFF_REGISTRATION_CODE)) {
    return NextResponse.json({ message: "کد دعوت پزشک یا منشی معتبر نیست." }, { status: 403 });
  }
  if (!body.password || body.password.length < 8 || body.password.length > 72) {
    return NextResponse.json(
      { message: "رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(body.password, 10),
      role: body.role,
    },
  });
  const token = await createSessionToken({ userId: user.id, role: user.role });
  const response = NextResponse.json({ success: true }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
