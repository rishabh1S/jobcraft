import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const [statusGroups, atsAgg, processingCount, total] = await Promise.all([
      prisma.job.groupBy({
        by: ["applicationStatus"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.job.aggregate({
        where: { userId },
        _avg: { atsScore: true, atsScoreAfter: true },
      }),
      prisma.job.count({ where: { userId, status: "processing" } }),
      prisma.job.count({ where: { userId } }),
    ]);

    const c = Object.fromEntries(statusGroups.map((g) => [g.applicationStatus, g._count._all]));

    const interviewing = c["interviewing"] ?? 0;
    const selected     = c["selected"] ?? 0;
    const responded    = (c["received_revert"] ?? 0) + interviewing + selected;
    const applied      = (c["applied"] ?? 0) + responded + (c["rejected"] ?? 0) + (c["ghosted"] ?? 0);

    return NextResponse.json({
      total,
      receivedRevert: c["received_revert"] ?? 0,
      interviewing,
      selected,
      responded,
      applied,
      avgAtsBefore: atsAgg._avg.atsScore !== null ? Math.round(atsAgg._avg.atsScore!) : null,
      avgAtsAfter:  atsAgg._avg.atsScoreAfter !== null ? Math.round(atsAgg._avg.atsScoreAfter!) : null,
      processing: processingCount,
    });
  } catch (error) {
    console.error("GET /api/jobs/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
