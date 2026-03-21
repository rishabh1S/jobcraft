import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
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
