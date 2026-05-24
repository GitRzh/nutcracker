# Nutcracker — Auto Documentation Generator

> Paste a GitHub URL or drop in your code files. Get a full README and API reference in seconds.

---

## What it does

You give Nutcracker a GitHub repo URL or upload your code, and it reads the entire codebase and generates two things — a complete README and a detailed API reference. No prompts to write, no config per project. Just paste and go.

**What it can do:**
- Accept any public GitHub repo URL and fetch the code automatically
- Accept file uploads — a `.zip` of your project or individual source files
- Generate a full README with overview, setup, usage, and project structure
- Generate an API reference covering every exported function and endpoint
- Download both as `.md` files, ready to drop into any repo

---

## Tech Stack

| Layer | Has |
|---|---|
| Framework | Next.js 16, TypeScript |
| LLM | Llama 3.3 70B via Groq API |
| GitHub fetching | Octokit |
| ZIP parsing | JSZip |
| Frontend | Tailwind CSS, react-markdown |
| Deployment | Netlify |

---

## File Structure

```
techdocs-generator/
│
├── app/
│   ├── layout.tsx               # Root layout, metadata
│   ├── page.tsx                 # Main UI
│   ├── globals.css              # Global styles
│   └── api/
│       ├── github/route.ts      # Fetches files from a GitHub repo
│       └── generate/route.ts   # Orchestrates doc generation
│
├── components/
│   ├── InputForm.tsx            # GitHub URL + file upload UI
│   ├── DocPreview.tsx           # Markdown renderer
│   ├── ProgressBar.tsx          # Generation progress indicator
│   ├── FileTree.tsx             # Shows analyzed files
│   └── DownloadButton.tsx       # Export docs as .md
│
├── lib/
│   ├── groq.ts                  # Groq API client
│   ├── github.ts                # GitHub REST API calls
│   ├── chunker.ts               # Format files for prompt
│   ├── assembler.ts             # Merge outputs
│   ├── fileParser.ts            # Parse .zip and individual files
│   └── prompts.ts               # All AI prompt templates
│
├── types/index.ts               # Shared TypeScript types
├── .env.local                   # API keys (never commit this)
└── package.json
```

---

## Setup

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/techdocs-generator.git
cd techdocs-generator
```

**2. Install dependencies**
```bash
npm install
```

**3. Get a free Groq API key**

Go to [console.groq.com](https://console.groq.com) → API Keys → Create key. Free tier includes 14,400 requests/day.

**4. Create a `.env.local` file in the project root**
```
GROQ_API_KEY=your_groq_api_key_here
```

Optionally add a GitHub token for higher rate limits on large repos:
```
GITHUB_TOKEN=ghp_your_token_here
```
Get one at [github.com/settings/tokens](https://github.com/settings/tokens) — no permissions needed for public repos.

**5. Run it**
```bash
npm run dev
```

Open `http://localhost:3000`. Done.

---

## Usage

**Option A — GitHub URL:**
1. Paste any public GitHub repo URL, e.g. `https://github.com/vercel/next.js`
2. Click **Generate Documentation**
3. Wait 10–20 seconds
4. Download `README.md` and `API_REFERENCE.md`

**Option B — File upload:**
1. Click **Upload Files**
2. Drop a `.zip` of your project, or select individual source files
3. Click **Generate Documentation**
4. Download your docs

---

## Caution

A few things to know:

- **Groq free tier has token limits.** The app trims code to ~8k chars per request to stay within limits, so very large repos get truncated.

- **GitHub rate limits.** Without a `GITHUB_TOKEN`, the GitHub API allows 60 requests/hour. Add a token to raise this to 5,000/hour.

- **JSON parsing can fail.** The LLM is prompted to return raw JSON for the overview. If it adds extra text, the app falls back to stripping markdown fences before parsing — but edge cases exist.

- **Sessions are stateless.** No data is stored anywhere. Refreshing the page clears everything.

- **Private repos won't work** unless you add a `GITHUB_TOKEN` with repo access.

---

*Built for the AI Builders Hackathon — May 2026.*
