import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Auto-ghost: "applied" jobs where appliedAt > 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.job.updateMany({
      where: {
        userId,
        applicationStatus: "applied",
        appliedAt: { lt: sevenDaysAgo },
      },
      data: { applicationStatus: "ghosted" },
    });

    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { jobLink, jobDescription } = body;

    if (!jobDescription || jobDescription.trim().length < 10) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId,
        jobLink: jobLink || null,
        jobDescription: jobDescription.trim(),
        status: "processing",
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
