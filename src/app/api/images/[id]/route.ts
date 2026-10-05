import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
  const { id } = await context.params;
  const image = await prisma.xRayImage.findUnique({ where: { id }, include: { patient: true } });
  if (!image) return new NextResponse("Not found", { status: 404 });
  const allowed = user.role === "SUPER_ADMIN" || (user.role === "PATIENT" ? image.patient.userId === user.id : Boolean(user.clinicId && user.clinicId === image.patient.clinicId));
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });
  const fileName = image.url.split("/").pop();
  if (!fileName || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(fileName)) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(process.cwd(), "uploads", "xrays", fileName));
    return new NextResponse(data, { headers: { "Content-Type": image.mimeType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
