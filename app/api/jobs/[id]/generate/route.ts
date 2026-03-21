import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import { generateCoverLetter } from "@/app/api/jobs/[id]/cover-letter/route";
import { getResumeAnalysisSystemPrompt, getResumeAnalysisUserPrompt } from "@/lib/prompts/resume-analysis";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let generateCoverLetterFlag = false;
  try {
    const body = await request.json();
    generateCoverLetterFlag = !!body?.generateCoverLetter;
  } catch {
    // body is optional
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userName = session.user.name ?? "the candidate";

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "No master resume found. Please upload your resume first." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getResumeAnalysisSystemPrompt() },
        { role: "user", content: getResumeAnalysisUserPrompt({ resumeText: profile.resumeText, jobDescription: job.jobDescription }) },
      ],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    const parsed = JSON.parse(content);

    await prisma.job.update({
      where: { id },
      data: {
        companyName: parsed.companyName || "Unknown Company",
        roleTitle: parsed.roleTitle || "Unknown Role",
        atsScore: typeof parsed.atsScore === "number" ? parsed.atsScore : null,
        atsScoreAfter: typeof parsed.atsScoreAfter === "number" ? parsed.atsScoreAfter : null,
        keywordsFound: parsed.keywordsFound
          ? JSON.stringify(parsed.keywordsFound)
          : null,
        keywordsMissing: parsed.keywordsMissing
          ? JSON.stringify(parsed.keywordsMissing)
          : null,
        easyAdditions: parsed.easyAdditions
          ? JSON.stringify(parsed.easyAdditions)
          : null,
        riskAdditions: parsed.riskAdditions
          ? JSON.stringify(parsed.riskAdditions)
          : null,
        phrasesToUpdate: parsed.phrasesToUpdate
          ? JSON.stringify(parsed.phrasesToUpdate)
          : null,
        status: "done",
        errorMessage: null,
      },
    });

    // Optionally generate cover letter (non-blocking — failure doesn't affect job status)
    if (generateCoverLetterFlag) {
      try {
        const coverLetter = await generateCoverLetter({
          resumeText: profile.resumeText,
          jobDescription: job.jobDescription,
          companyName: parsed.companyName || job.companyName,
          roleTitle: parsed.roleTitle || job.roleTitle,
          userName,
        });
        await prisma.job.update({ where: { id }, data: { coverLetter } });
      } catch (clErr) {
        console.error(`Cover letter generation failed for job ${id}:`, clErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`POST /api/jobs/${id}/generate error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    await prisma.job.update({
      where: { id },
      data: {
        status: "error",
        errorMessage,
      },
    }).catch(() => {});

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
