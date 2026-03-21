import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Auto-ghost: "applied" jobs where appliedAt > 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.job.updateMany({
      where: {
        applicationStatus: "applied",
        appliedAt: { lt: sevenDaysAgo },
      },
      data: { applicationStatus: "ghosted" },
    });

    const jobs = await prisma.job.findMany({
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
