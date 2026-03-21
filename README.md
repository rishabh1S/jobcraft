# JobCraft — AI Resume Tailor

Track job applications and get AI-powered resume suggestions tailored to each job description.

---

## What it does

- Paste a job description → AI analyses your master resume against it
- Get an **ATS score** (before and after applying suggestions)
- See exactly which **keywords are matched / missing**
- Receive **easy additions** (low-risk, you already know them) and **risk additions** (gaps you'd need to genuinely fill)
- Get **specific phrase rewrites** for weak bullet points — verbatim originals with improved versions
- Track each application through its lifecycle: **Ready to Apply → Applied → Received Revert → Interviewing → Selected / Rejected**
- Auto-ghosts applications that stay in "Applied" for more than 7 days with no update
- Click a job link to open it and auto-mark as Applied in one action

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via NeonDB |
| ORM | Prisma v7 (adapter pattern with `@prisma/adapter-pg`) |
| AI | Groq — `llama-3.3-70b-versatile` |
| Resume parsing | `pdf-parse` v1 · `mammoth` (DOCX) |
| Data fetching | SWR (live polling while AI is running) |
| UI | `lucide-react` · `react-hot-toast` · `date-fns` |

---

## Project structure

```
app/
  page.tsx                      # Dashboard
  layout.tsx
  globals.css
  profile/
    page.tsx                    # Master resume upload
  api/
    jobs/
      route.ts                  # GET all jobs · POST create job
      [id]/
        route.ts                # GET · PATCH (status) · DELETE
        generate/route.ts       # POST — triggers Groq AI analysis
        retry/route.ts          # POST — re-runs failed analysis
    profile/
      route.ts                  # GET profile
      upload/route.ts           # POST — parse & store resume

components/
  Navbar.tsx
  StatsRow.tsx                  # Funnel stats + avg ATS progress bar
  JobTable.tsx                  # Main applications table
  NewApplicationSheet.tsx       # Slide-in new job form (4k char limit)
  SuggestionsModal.tsx          # AI results: keywords, phrases, additions
  ConfirmDeleteModal.tsx

lib/
  prisma.ts                     # Prisma client (PrismaPg adapter)
  types.ts                      # Job, Profile, ApplicationStatus types

prisma/
  schema.prisma
prisma.config.ts                # Prisma v7 config — loads .env.local manually
```

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd jobcraft
yarn install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL=postgresql://...     # NeonDB (free tier works): https://neon.tech
GROQ_API_KEY=gsk_...              # Free API key: https://console.groq.com
```

### 3. Push the database schema

```bash
npx prisma db push
npx prisma generate
```

### 4. Run locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Go to **/profile** and upload your master resume (PDF or DOCX)
2. Click **New Application** on the dashboard
3. Paste the job description (max 4,000 chars) and optionally add the job URL
4. AI analysis runs in the background — the row polls automatically until complete
5. Click the **eye icon** to open the suggestions panel
6. When ready to apply, click the **external link icon** next to the company name — opens the job URL and auto-sets status to "Applied"
7. Update the application status dropdown as you progress

---

## Application status flow

```
Ready to Apply → Applied → Received Revert → Interviewing → Selected
                                                           → Rejected
                  ↓ (automatic after 7 days)
                Ghosted
```

- **Ready to Apply** — AI analysis done, not yet applied
- **Applied** — stamped with a timestamp when you click the job link (or set manually)
- **Ghosted** — auto-set if still "Applied" after 7 days with no status change

---

## Key technical notes

**Prisma v7** uses an adapter pattern — the `DATABASE_URL` is not in `schema.prisma` but in `prisma.config.ts` via `defineConfig`. The config manually calls `dotenv.config({ path: '.env.local' })` since the Prisma CLI doesn't auto-load `.env.local`.

**pdf-parse** is pinned to v1 (`"pdf-parse": "1"` in package.json). v2 has a completely different class-based API. The import uses the internal path `pdf-parse/lib/pdf-parse.js` to avoid a test-file loading error in Next.js.

**No document generation** — the AI returns structured JSON with actionable text suggestions only (`easyAdditions`, `riskAdditions`, `phrasesToUpdate` with verbatim originals + rewrites). No `.docx` output.
