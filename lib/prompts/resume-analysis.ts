export function getResumeAnalysisSystemPrompt(): string {
  return `You are an ATS resume analyst. Analyze resumes against job descriptions with precision.
Never fabricate. All suggestions must reference content that actually exists in the resume.
Respond ONLY with valid JSON. No markdown, no code fences, no explanation.`;
}

export function getResumeAnalysisUserPrompt({
  resumeText,
  jobDescription,
}: {
  resumeText: string;
  jobDescription: string;
}): string {
  return `Analyze this resume against the job description. Follow these steps in order:

STEP 1 — Tier classification (internal scratch work, not in JSON output):
Classify every JD requirement into three tiers:
- coreRequirements (4–6 items): role-defining skills/experience — appears in the job title or mentioned 3+ times, or stated as must-have
- supportingRequirements (4–6 items): clearly required but secondary — mentioned 1–2 times, tools, degree, years of experience
- niceToHaveRequirements (2–4 items): implied or bonus — soft skills, familiarity, exposure

STEP 2 — Semantic scoring per requirement (internal, not in JSON output):
For each requirement across all tiers, assign a score:
- 1.0 = resume directly and explicitly demonstrates this
- 0.5 = resume implies it through adjacent or closely related work
- 0.0 = no evidence whatsoever in the resume

STEP 3 — Compute atsScore:
core_avg = average of all core requirement scores
supporting_avg = average of all supporting requirement scores
nicetohave_avg = average of all nicetohave requirement scores
atsScore = round(core_avg * 60 + supporting_avg * 30 + nicetohave_avg * 10)

STEP 4 — Build keyword lists:
keywordsFound: requirements scored 1.0 or 0.5 (resume demonstrates or implies them)
keywordsMissing: requirements scored 0.0 (genuine gaps)

STEP 5 — Phrase rewrites:
Only look in Experience, Projects, and Summary/Overview sections (never Skills — keyword additions there are handled by easyAdditions/riskAdditions).
Identify up to 5 bullets/sentences where a single rewrite would move a core or supporting requirement from 0.0/0.5 toward 1.0 by explicitly naming the relevant skill or domain. Skip bullets already well-aligned. Max 5.

STEP 6 — Additions:
easyAdditions (3–5): requirements the resume implies (scored 0.5) that could be made explicit with a small edit — name the exact resume section and which requirement it surfaces.
riskAdditions (2–3): core requirements scored 0.0 that are genuine gaps — name the exact skill and be honest about the risk of adding it.

STEP 7 — Projected score:
atsScoreAfter = atsScore + (easyAdditions.length * 3) + (count of low-risk riskAdditions * 2)
Cap at 95.

Return this exact JSON:
{
  "atsScore": <integer>,
  "atsScoreAfter": <integer>,
  "keywordsFound": ["string"],
  "keywordsMissing": ["string"],
  "easyAdditions": ["string — exact section name + which JD requirement it surfaces"],
  "riskAdditions": ["string — exact skill + honest gap note"],
  "phrasesToUpdate": [
    {
      "section": "Experience | Projects | Summary (never Skills)",
      "original": "verbatim bullet copied from resume — never paraphrase",
      "suggested": "rewritten bullet that explicitly names the JD requirement without changing facts",
      "reason": "which requirement this moves from 0.5→1.0 or 0.0→0.5 and why"
    }
  ]
}

RULES:
- phrasesToUpdate: max 5 entries, sourced only from Experience, Projects, or Summary/Overview sections. original must be verbatim — copy it exactly.
- easyAdditions/riskAdditions: these cover Skills section additions — do not duplicate them in phrasesToUpdate.
- atsScore must follow the tier-weighted formula in STEP 3. Do not guess or estimate independently.
- A resume that only implies security experience (but lacks the core domain) should score lower on core, not equal to one that demonstrates it directly.

Resume:
${resumeText}

Job Description:
${jobDescription}`;
}
