import { CodeFile, GithubFile } from "@/types";

const SUPPORTED_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs",
  ".cpp", ".c", ".cs", ".rb", ".php", ".swift", ".kt", ".md",
  ".json", ".yaml", ".yml", ".env.example", ".sh"
];

const SKIP_PATHS = [
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  ".pytest_cache", "venv", ".venv", "coverage", ".nyc_output"
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

function shouldSkip(path: string): boolean {
  return SKIP_PATHS.some(skip => path.includes(skip));
}

function isSupported(path: string): boolean {
  return SUPPORTED_EXTENSIONS.some(ext => path.endsWith(ext));
}

export async function parseRepoUrl(url: string): Promise<{ owner: string; repo: string }> {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL. Format: https://github.com/owner/repo");
  return { owner: match[1], repo: match[2].replace(".git", "") };
}

export async function fetchRepoFiles(owner: string, repo: string): Promise<CodeFile[]> {
  const headers: Record<string, string> = { "Accept": "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Get the full tree recursively
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );

  if (!treeRes.ok) {
    const err = await treeRes.json();
    throw new Error(err.message || "Failed to fetch repo. Check it's public.");
  }

  const tree = await treeRes.json();
  const files: GithubFile[] = tree.tree.filter(
    (f: GithubFile) => f.type === "blob" && !shouldSkip(f.path) && isSupported(f.path)
  ).slice(0, 40); // cap at 40 files to avoid token overflow

  // Fetch file contents in parallel (batches of 10)
  const results: CodeFile[] = [];
  for (let i = 0; i < files.length; i += 10) {
    const batch = files.slice(i, i + 10);
    const fetched = await Promise.allSettled(
      batch.map(async (f) => {
        const raw = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`
        );
        if (!raw.ok) return null;
        const content = await raw.text();
        if (content.length > 15000) return null; // skip huge files
        return { path: f.path, content, language: getLanguage(f.path) } as CodeFile;
      })
    );
    fetched.forEach(r => {
      if (r.status === "fulfilled" && r.value) results.push(r.value);
    });
  }

  return results;
}
