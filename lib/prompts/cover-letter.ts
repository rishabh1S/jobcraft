export function getCoverLetterSystemPrompt(): string {
  return `You write cover letters that sound like a real person wrote them — not a recruiter, not a robot. Warm, direct, and grounded. You pick 1-2 specific things from the candidate's background that genuinely connect to what this role needs, and you say it plainly. No corporate buzzwords, no hollow enthusiasm, no phrases like "I am writing to express my interest" or "I am a results-driven professional". Output only the cover letter text — nothing else, no subject line, no labels.`;
}

export function getCoverLetterUserPrompt({
  userName,
  companyName,
  roleTitle,
  resumeText,
  jobDescription,
}: {
  userName: string;
  companyName: string;
  roleTitle: string;
  resumeText: string;
  jobDescription: string;
}): string {
  return `Write a cover letter for this application formatted exactly like a formal email/letter. Target 200-250 words for the body — tight and focused, not padded.

Use this exact structure:
[Today's date]

Hiring Team
[Company name]

Dear Hiring Manager,

[Paragraph 1 — why this role at this company resonates. Be real, not salesy.]

[Paragraph 2 — 1-2 concrete things from the resume that are directly relevant. Name actual projects or skills, don't just list traits.]

[Paragraph 3 — brief, human closing. Express genuine interest, invite a conversation.]

Best,
[Candidate's name]

Style rules:
- The opening paragraph should start with something specific and genuine, not a generic opener
- No corporate buzzwords, no "I am excited to apply" type phrases
- Sound like a real person, not a template

Candidate name: ${userName}
Target company: ${companyName}
Target role: ${roleTitle}

Resume:
${resumeText}

Job description:
${jobDescription}`;
}
