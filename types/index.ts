export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

export interface DocChunk {
  filePath: string;
  docs: string;
}

export interface GenerateRequest {
  repoUrl?: string;
  files?: CodeFile[];
  docType: "readme" | "api" | "full";
}

export interface GenerateResponse {
  readme?: string;
  apiDocs?: string;
  overview?: string;
  fileCount: number;
  error?: string;
}

export interface GithubFile {
  path: string;
  type: string;
  download_url: string | null;
}
