import { CodeFile } from "@/types";

const SUPPORTED_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs",
  ".cpp", ".c", ".cs", ".rb", ".php", ".swift", ".kt", ".md",
  ".json", ".yaml", ".yml", ".sh"
];

const SKIP_PATHS = [
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  "venv", ".venv", "coverage"
];

function getLanguage(path: string): string {
  const ext = "." + path.split(".").pop();
  const map: Record<string, string> = {
    ".ts": "typescript", ".tsx": "typescript", ".js": "javascript",
    ".jsx": "javascript", ".py": "python", ".go": "go", ".java": "java",
    ".rs": "rust", ".cpp": "cpp", ".c": "c", ".cs": "csharp",
    ".rb": "ruby", ".php": "php", ".swift": "swift", ".kt": "kotlin",
    ".md": "markdown", ".json": "json", ".yaml": "yaml", ".yml": "yaml",
    ".sh": "bash"
  };
  return map[ext] || "text";
}

export async function parseZipFile(buffer: ArrayBuffer): Promise<CodeFile[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const files: CodeFile[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    if (SKIP_PATHS.some(s => path.includes(s))) continue;
    if (!SUPPORTED_EXTENSIONS.some(ext => path.endsWith(ext))) continue;

    const content = await file.async("text");
    if (content.length > 15000) continue;

    files.push({ path, content, language: getLanguage(path) });
    if (files.length >= 40) break;
  }

  return files;
}

export async function parseTextFiles(formData: FormData): Promise<CodeFile[]> {
  const files: CodeFile[] = [];
  const entries = Array.from(formData.entries());

  for (const [, value] of entries) {
    if (!(value instanceof File)) continue;
    const file = value as File;
    if (!SUPPORTED_EXTENSIONS.some(ext => file.name.endsWith(ext))) continue;

    const content = await file.text();
    if (content.length > 15000) continue;

    files.push({
      path: file.name,
      content,
      language: getLanguage(file.name)
    });

    if (files.length >= 40) break;
  }

  return files;
}
