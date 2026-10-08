import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  }
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!name || name.length > 150 || !phone || phone.length < 7 || phone.length > 20) {
    return NextResponse.json({ message: "نام یا شماره تماس معتبر نیست." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "ذخیره اطلاعات حساب ناموفق بود." }, { status: 500 });
  }
}
