import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getAccessiblePatient, getCurrentUser, isSameOrigin } from "@/lib/serverAuth";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "درخواست نامعتبر است." }, { status: 403 });
  const actor = await getCurrentUser(request); if (!actor || !["SUPER_ADMIN", "DENTIST", "STAFF"].includes(actor.role)) return NextResponse.json({ message: "دسترسی مجاز نیست." }, { status: 403 });
  const { id } = await context.params; const patient = await getAccessiblePatient(request, id); if (!patient) return NextResponse.json({ message: "پرونده پیدا نشد." }, { status: 404 });
  const file = (await request.formData()).get("file"); if (!(file instanceof File) || !allowed.has(file.type) || !file.size || file.size > 10 * 1024 * 1024) return NextResponse.json({ message: "تصویر JPG، PNG یا WEBP تا حجم ۱۰ مگابایت انتخاب کنید." }, { status: 400 });
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storageName = `${randomUUID()}.${ext}`;
  const folder = path.join(process.cwd(), "uploads", "xrays");
  await mkdir(folder, { recursive: true });
  const storagePath = path.join(folder, storageName);
  await writeFile(storagePath, Buffer.from(await file.arrayBuffer()));
  try {
    const image = await prisma.xRayImage.create({ data: { url: `/uploads/xrays/${storageName}`, fileName: file.name, fileSize: file.size, mimeType: file.type, patientId: patient.id } });
    return NextResponse.json({ image: { ...image, url: `/api/images/${image.id}` } }, { status: 201 });
  } catch (error) {
    await unlink(storagePath).catch(() => {});
    throw error;
  }
}
