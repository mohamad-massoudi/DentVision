import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSameOrigin } from "@/lib/serverAuth";
import { createCredentialTag, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const actor = await getCurrentUser(request);
  if (!actor) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.currentPassword !== "string" || typeof body.newPassword !== "string" ||
      !body.currentPassword || body.newPassword.length < 8 ||
      Buffer.byteLength(body.newPassword, "utf8") > 72 || Buffer.byteLength(body.currentPassword, "utf8") > 72) {
    return NextResponse.json({ message: "رمز جدید باید حداقل ۸ نویسه و حداکثر ۷۲ بایت باشد." }, { status: 400 });
  }
  if (body.currentPassword === body.newPassword) return NextResponse.json({ message: "رمز جدید باید با رمز فعلی متفاوت باشد." }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { password: true } });
    if (!user || !await bcrypt.compare(body.currentPassword, user.password)) {
      return NextResponse.json({ message: "رمز عبور فعلی صحیح نیست." }, { status: 400 });
    }
    const password = await bcrypt.hash(body.newPassword, 10);
    // Compare-and-swap prevents overwriting a concurrently changed password.
    const updated = await prisma.user.updateMany({ where: { id: actor.id, password: user.password }, data: { password } });
    if (!updated.count) return NextResponse.json({ message: "رمز قبلاً تغییر کرده است؛ دوباره تلاش کنید." }, { status: 409 });
    const response = NextResponse.json({ message: "رمز تغییر کرد و نشست‌های قبلی باطل شدند." });
    response.cookies.set(SESSION_COOKIE, await createSessionToken({ userId: actor.id, role: actor.role, credentialTag: await createCredentialTag(password) }), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ message: "تغییر رمز انجام نشد؛ دوباره تلاش کنید." }, { status: 500 });
  }
}
