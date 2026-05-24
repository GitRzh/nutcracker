import { CodeFile } from "@/types";

const MAX_CHUNK_CHARS = 20000;

export interface Chunk {
  files: CodeFile[];
  totalChars: number;
}

export function chunkFiles(files: CodeFile[]): Chunk[] {
  const chunks: Chunk[] = [];
  let current: CodeFile[] = [];
  let currentChars = 0;

  for (const file of files) {
    const fileChars = file.content.length + file.path.length + 50;
    if (currentChars + fileChars > MAX_CHUNK_CHARS && current.length > 0) {
      chunks.push({ files: current, totalChars: currentChars });
      current = [];
      currentChars = 0;
    }
    current.push(file);
    currentChars += fileChars;
  }

  if (current.length > 0) {
    chunks.push({ files: current, totalChars: currentChars });
  }

  return chunks;
}

export function formatFilesForPrompt(files: CodeFile[]): string {
  return files.map(f =>
    `### File: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``
  ).join("\n\n");
}

export function getProjectStructure(files: CodeFile[]): string {
  return files.map(f => f.path).join("\n");
}
