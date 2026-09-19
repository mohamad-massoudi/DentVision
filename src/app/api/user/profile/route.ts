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

  const body = (await request.json()) as { name?: string; phone?: string };
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  if (!name || !phone || phone.length < 7 || phone.length > 20) {
    return NextResponse.json({ message: "نام یا شماره تماس معتبر نیست." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: { name, phone },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });
  return NextResponse.json({ user });
}
