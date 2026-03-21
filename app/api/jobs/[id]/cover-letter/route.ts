import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import { getCoverLetterSystemPrompt, getCoverLetterUserPrompt } from "@/lib/prompts/cover-letter";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const userId = session.user.id;
    const userName = session.user.name ?? "the candidate";

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json(
        { error: "No resume found. Please upload your resume first." },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetter({
      resumeText: profile.resumeText,
      jobDescription: job.jobDescription,
      companyName: job.companyName,
      roleTitle: job.roleTitle,
      userName,
    });

    await prisma.job.update({
      where: { id },
      data: { coverLetter },
    });

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error(`POST /api/jobs/${id}/cover-letter error:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function generateCoverLetter({
  resumeText,
  jobDescription,
  companyName,
  roleTitle,
  userName,
}: {
  resumeText: string;
  jobDescription: string;
  companyName: string;
  roleTitle: string;
  userName: string;
}): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: getCoverLetterSystemPrompt() },
      { role: "user", content: getCoverLetterUserPrompt({ userName, companyName, roleTitle, resumeText, jobDescription }) },
    ],
    temperature: 0.7,
    max_tokens: 700,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from Groq");
  return text;
}
