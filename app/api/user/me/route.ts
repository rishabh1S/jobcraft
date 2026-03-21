import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    return NextResponse.json({ hasPassword: !!user?.password });
  } catch (error) {
    console.error("GET /api/user/me error:", error);
    return NextResponse.json({ error: "Failed to fetch user." }, { status: 500 });
  }
}
