import { NextResponse, type NextRequest } from "next/server";
import { SESSION_MAX_AGE } from "@/lib/auth";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ session: null }, { status: 401 });
  }
  return NextResponse.json({
    session: {
      user: { ...user, phone: user.phone ?? "" },
      expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    },
  });
}
