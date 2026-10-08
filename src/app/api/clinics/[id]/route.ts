import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

type Context = { params: Promise<{ id: string }> };

async function permittedClinic(request: NextRequest, id: string) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 }) };
  if (user.role !== "SUPER_ADMIN" && (user.role !== "DENTIST" || user.clinicId !== id)) {
    return { error: NextResponse.json({ message: "اجازه مدیریت این کلینیک را ندارید." }, { status: 403 }) };
  }
  const clinic = await prisma.clinic.findUnique({ where: { id } });
  if (!clinic) return { error: NextResponse.json({ message: "کلینیک پیدا نشد." }, { status: 404 }) };
  return { clinic };
}

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const result = await permittedClinic(request, id);
  return result.error ?? NextResponse.json({ clinic: result.clinic }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const { id } = await context.params;
  const result = await permittedClinic(request, id);
  if (result.error) return result.error;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || typeof body.phone !== "string" || typeof body.address !== "string") {
    return NextResponse.json({ message: "نام، تلفن و آدرس مطب الزامی است." }, { status: 400 });
  }
  const name = body.name.trim(), phone = body.phone.trim(), address = body.address.trim();
  if (!name || name.length > 150 || phone.length < 7 || phone.length > 20 || !address || address.length > 1000) {
    return NextResponse.json({ message: "نام، تلفن یا آدرس مطب معتبر نیست." }, { status: 400 });
  }
  try {
    const clinic = await prisma.clinic.update({ where: { id }, data: { name, phone, address } });
    return NextResponse.json({ clinic, message: "اطلاعات مطب ذخیره شد." });
  } catch {
    return NextResponse.json({ message: "ذخیره اطلاعات مطب ناموفق بود." }, { status: 500 });
  }
}
