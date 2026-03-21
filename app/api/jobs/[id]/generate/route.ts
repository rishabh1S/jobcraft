import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import { generateCoverLetter } from "@/app/api/jobs/[id]/cover-letter/route";

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

    const systemMessage = `You are a senior technical resume consultant and ATS optimization expert.
Your job is to do a THOROUGH line-by-line analysis of the candidate's resume against the job description.
You must identify every meaningful improvement opportunity — weak bullet points, missing keywords, underrepresented skills.
Never fabricate experience. Every suggestion must be grounded in what the resume already contains.
Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.`;

    const userMessage = `Do a complete resume audit against this job description. Read every bullet point and every section of the resume carefully.

Return this exact JSON structure:
{
  "companyName": "company name from JD, or 'Unknown Company'",
  "roleTitle": "exact job title from JD",
  "atsScore": <integer 0-100: honest current keyword match before any edits>,
  "atsScoreAfter": <integer 0-100: realistic projected score after all suggestions applied>,
  "keywordsFound": [
    "every significant keyword/tool/skill/methodology from the JD that already appears in the resume"
  ],
  "keywordsMissing": [
    "every important keyword from the JD that is absent from the resume (tools, frameworks, methodologies, soft skills)"
  ],
  "easyAdditions": [
    "SPECIFIC actionable item — name the exact section and what to add. Example: 'Add \"CI/CD\" to your Skills section — the JD mentions it 5 times and your projects already use GitHub Actions which implies this skill'",
    "Another specific easy win with section name and rationale..."
  ],
  "riskAdditions": [
    "SPECIFIC gap — name the exact skill and why it's risky. Example: 'JD requires Terraform (mentioned 4 times) — not present anywhere in your resume; only add if you have genuine hands-on experience'",
    "Another specific gap..."
  ],
  "phrasesToUpdate": [
    {
      "section": "exact section name from resume (e.g. Experience, Projects, Summary)",
      "original": "EXACT verbatim sentence or bullet point copied from the resume — do not paraphrase",
      "suggested": "rewritten version that naturally weaves in JD keywords while keeping the same factual content",
      "reason": "specific ATS/impact reason: which JD keywords this adds and why the new phrasing is stronger"
    }
  ]
}

IMPORTANT RULES:
- phrasesToUpdate: scan EVERY bullet point across ALL experience and project entries. Target 6-12 phrases — prioritise bullets that are vague, use weak verbs, or miss obvious JD keywords. The "original" must be copied verbatim from the resume.
- easyAdditions: provide 3-6 specific items with exact section names
- riskAdditions: provide 2-4 items, be honest about severity
- keywordsFound / keywordsMissing: be exhaustive — include tools, languages, frameworks, methodologies, and domain terms
- atsScoreAfter should reflect a realistic improvement, not wishful thinking

Master Resume:
${profile.resumeText}

Job Description:
${job.jobDescription}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
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
