export function getResumeAnalysisSystemPrompt(): string {
  return `You are a senior technical resume consultant and ATS optimization expert.
Your job is to do a THOROUGH line-by-line analysis of the candidate's resume against the job description.
You must identify every meaningful improvement opportunity — weak bullet points, missing keywords, underrepresented skills.
Never fabricate experience. Every suggestion must be grounded in what the resume already contains.
Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.`;
}

export function getResumeAnalysisUserPrompt({
  resumeText,
  jobDescription,
}: {
  resumeText: string;
  jobDescription: string;
}): string {
  return `Do a complete resume audit against this job description. Read every bullet point and every section of the resume carefully.

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
    "SPECIFIC actionable item — name the exact section and what to add. Example: 'Add "CI/CD" to your Skills section — the JD mentions it 5 times and your projects already use GitHub Actions which implies this skill'",
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
${resumeText}

Job Description:
${jobDescription}`;
}
