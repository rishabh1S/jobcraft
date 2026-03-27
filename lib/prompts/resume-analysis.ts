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
Go through EVERY bullet/sentence in the Experience and Projects sections. For each bullet, evaluate whether it needs rephrasing to better match the JD language, framing, or to surface a requirement it currently only implies.
Include a bullet in phrasesToUpdate only if:
  a) It scores 0.5 on a core/supporting requirement that could become 1.0 with a targeted rewrite, AND
  b) The rewrite adds something genuinely new — do NOT rewrite a bullet just to append a skill/technology that is already explicitly named in that bullet. That is redundant and adds no value.
Focus rewrites on: improving framing, adopting JD-specific terminology, surfacing implied experience more explicitly, or tightening language — not on keyword-stuffing skills already present.

STEP 6 — Skills section additions (Skills section ONLY — never Experience/Projects/Summary):
Look at the JD skills that are absent from the resume's Skills section. Classify each into exactly one bucket:

easyAdditions (max 3–4): A JD skill NOT in the resume's Skills section, but the resume already lists a closely related technology that makes this a natural, credible companion. The bridge must be concrete and specific:
  - "has Spring Boot → Maven or Gradle" (standard build tools in that ecosystem)
  - "has React → Redux or TypeScript" (common React companions)
  - "has Java → JUnit" (standard Java testing framework)
  Do NOT classify as easy just because the skill is common or simple. The resume must already show evidence of the ecosystem it belongs to.

riskAdditions (max 2–3): A JD skill NOT in the resume AND no related foundation exists in the resume that bridges to it. These are genuine gaps — adding them without real experience is dishonest.

MUTUAL EXCLUSION: Every skill must appear in exactly one list or neither. NEVER in both. If you find a skill in both lists, move it to riskAdditions and remove it from easyAdditions.

STEP 7 — Projected score:
atsScoreAfter = atsScore + (easyAdditions.length * 3) + (count of low-risk riskAdditions * 2)
Cap at 95.

Return this exact JSON:
{
  "atsScore": <integer>,
  "atsScoreAfter": <integer>,
  "keywordsFound": ["string"],
  "keywordsMissing": ["string"],
  "easyAdditions": ["skill name — why it's a natural extension of [existing resume skill]"],
  "riskAdditions": ["skill name — what's genuinely missing and why it would be risky to claim"],
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
- phrasesToUpdate: cover ALL bullets that need updating. Include only bullets where the rewrite meaningfully improves JD alignment. original must be verbatim — copy it exactly.
- NEVER add a skill or technology to the suggested rewrite if that exact skill/technology is already explicitly named in the original bullet. Check the original carefully before adding any term.
- easyAdditions/riskAdditions: Skills section only. A skill must appear in exactly one list or neither — never both. If unsure, put it in riskAdditions. Do not duplicate in phrasesToUpdate.
- atsScore must follow the tier-weighted formula in STEP 3. Do not guess or estimate independently.
- A resume that only implies security experience (but lacks the core domain) should score lower on core, not equal to one that demonstrates it directly.

Resume:
${resumeText}

Job Description:
${jobDescription}`;
}
