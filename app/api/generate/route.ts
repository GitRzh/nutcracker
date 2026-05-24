import { NextRequest, NextResponse } from "next/server";
import { generateText, generateJSON } from "@/lib/groq";
import { formatFilesForPrompt, getProjectStructure } from "@/lib/chunker";
import { parseZipFile, parseTextFiles } from "@/lib/fileParser";
import { COMBINED_PROMPT, API_DOCS_PROMPT } from "@/lib/prompts";
import { CodeFile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let files: CodeFile[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const zipFile = formData.get("zip") as File | null;
      if (zipFile && zipFile.name.endsWith(".zip")) {
        const buffer = await zipFile.arrayBuffer();
        files = await parseZipFile(buffer);
      } else {
        files = await parseTextFiles(formData);
      }
    } else {
      const body = await req.json();
      files = body.files;
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files to process." }, { status: 400 });
    }

    const structure = getProjectStructure(files);
    // Limit total code sent to ~40k chars to stay in one prompt
    let allCode = formatFilesForPrompt(files);
    if (allCode.length > 8000) {
      allCode = allCode.slice(0, 8000) + "\n\n[...truncated]";
    }

    // Call 1: overview + README
    const combined = await generateJSON<{
      projectName: string;
      description: string;
      techStack: string[];
      mainFeatures: string[];
      projectType: string;
      readme: string;
    }>(COMBINED_PROMPT(structure, allCode));

    // Call 2: API docs
    const apiDocs = await generateText(API_DOCS_PROMPT(allCode));

    return NextResponse.json({
      readme: combined.readme,
      apiDocs,
      overview: {
        projectName: combined.projectName,
        description: combined.description,
        techStack: combined.techStack,
        mainFeatures: combined.mainFeatures,
        projectType: combined.projectType,
      },
      fileCount: files.length
    });

  } catch (err: any) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: err.message || "Generation failed. Check your API key." },
      { status: 500 }
    );
  }
}