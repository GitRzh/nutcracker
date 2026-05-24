import { NextRequest, NextResponse } from "next/server";
import { fetchRepoFiles, parseRepoUrl } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });

    const { owner, repo } = await parseRepoUrl(repoUrl);
    const files = await fetchRepoFiles(owner, repo);

    if (files.length === 0) {
      return NextResponse.json({ error: "No supported files found in this repo." }, { status: 400 });
    }

    return NextResponse.json({ files, count: files.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch repo" }, { status: 500 });
  }
}
