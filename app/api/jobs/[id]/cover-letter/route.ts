import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";

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
      {
        role: "system",
        content: `You write cover letters that sound like a real person wrote them — not a recruiter, not a robot. Warm, direct, and grounded. You pick 1-2 specific things from the candidate's background that genuinely connect to what this role needs, and you say it plainly. No corporate buzzwords, no hollow enthusiasm, no phrases like "I am writing to express my interest" or "I am a results-driven professional". Output only the cover letter text — nothing else, no subject line, no labels.`,
      },
      {
        role: "user",
        content: `Write a cover letter for this application. Format it like a proper letter: greeting, 3 short paragraphs, then a sign-off. Target 200-250 words total — tight and focused, not padded.

Style rules:
- Open with something specific and genuine, not a generic opener
- Paragraph 1: why this role at this company resonates (be real, not salesy)
- Paragraph 2: 1-2 concrete things from the resume that are directly relevant — name actual projects or skills, don't just list traits
- Paragraph 3: brief, human closing — express genuine interest, invite a conversation
- Sign off naturally: "Best," or "Thanks," then the candidate's name on the next line

Candidate name: ${userName}
Target company: ${companyName}
Target role: ${roleTitle}

Resume:
${resumeText}

Job description:
${jobDescription}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from Groq");
  return text;
}
