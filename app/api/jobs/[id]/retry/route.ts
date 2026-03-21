import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.job.update({
      where: { id },
      data: {
        status: "processing",
        errorMessage: null,
      },
    });

    // Fire and forget generate
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/jobs/${id}/generate`, {
      method: "POST",
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`POST /api/jobs/${id}/retry error:`, error);
    return NextResponse.json({ error: "Failed to retry job" }, { status: 500 });
  }
}
