import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json({ job });
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { applicationStatus } = body;

    const valid = [
      "ready_to_apply", "applied", "received_revert",
      "interviewing", "selected", "rejected", "ghosted",
    ];
    if (!valid.includes(applicationStatus)) {
      return NextResponse.json({ error: "Invalid applicationStatus" }, { status: 400 });
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        applicationStatus,
        // Record when first marked as applied
        ...(applicationStatus === "applied" ? { appliedAt: new Date() } : {}),
      },
    });
    return NextResponse.json({ job });
  } catch (error) {
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
