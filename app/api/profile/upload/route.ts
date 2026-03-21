import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use internal path to avoid Next.js module resolution issues with test-file loading
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const result = await pdfParse(buffer);
  return result.text;
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function cleanText(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, idx, arr) => {
      // Collapse consecutive blank lines into one
      if (line.trim() === "" && idx > 0 && arr[idx - 1].trim() === "") {
        return false;
      }
      return true;
    })
    .join("\n")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resumeFile") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "doc", "docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let resumeText = "";
    try {
      if (ext === "pdf") {
        resumeText = await extractTextFromPDF(buffer);
      } else {
        resumeText = await extractTextFromDocx(buffer);
      }
    } catch (parseError) {
      console.error("File parse error:", parseError);
      return NextResponse.json(
        { error: `Failed to read the ${ext.toUpperCase()} file. Make sure it is not password-protected or corrupted.` },
        { status: 400 }
      );
    }

    resumeText = cleanText(resumeText);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please try a different file." },
        { status: 400 }
      );
    }

    // Store base64-encoded original file only for DOCX (used for format-preserving download)
    const fileBuffer = ext === "docx" ? buffer.toString("base64") : null;
    const fileExt = ext;

    const profile = await prisma.profile.upsert({
      where: { id: "singleton" },
      update: { resumeText, fileName, fileBuffer, fileExt },
      create: { id: "singleton", resumeText, fileName, fileBuffer, fileExt },
    });

    return NextResponse.json({
      success: true,
      fileName: profile.fileName,
      preview: resumeText.slice(0, 300),
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    console.error("POST /api/profile/upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
