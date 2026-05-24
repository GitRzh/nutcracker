export const COMBINED_PROMPT = (structure: string, code: string) => `
You are a senior technical writer. Analyze this codebase and return a JSON object only (no markdown, raw JSON).

FILE STRUCTURE:
${structure}

CODE:
${code}

Return this exact JSON shape:
{
  "projectName": "inferred project name",
  "description": "1-2 sentence description",
  "techStack": ["list", "of", "technologies"],
  "mainFeatures": ["feature 1", "feature 2", "feature 3"],
  "projectType": "web app | cli tool | library | api | mobile app | other",
  "readme": "full README.md content as a string with these sections: # ProjectName, ## Overview, ## Features, ## Tech Stack, ## Getting Started (Prerequisites + Installation + Environment Variables), ## Usage, ## Project Structure, ## Contributing, ## License. Use real info from the code. Escape any quotes inside the string."
}
`.trim();

export const API_DOCS_PROMPT = (files: string) => `
You are a senior developer writing API documentation.

Analyze these code files and generate comprehensive API/function documentation:

${files}

Write detailed Markdown documentation covering:
1. Every exported function, class, and interface
2. For each: description, parameters (name, type, description), return value, example usage
3. Any REST API endpoints (method, path, request body, response)
4. Important types and interfaces
5. Usage examples with code blocks

Format as clean Markdown with ## headings per module/file.
Be thorough and accurate — only document what you can see in the code.
`.trim();

export const MERGE_CHUNKS_PROMPT = (partialDocs: string[]) => `
You are a technical writer. Merge these partial API documentation sections into one cohesive document.
Remove duplicates, fix inconsistencies, and ensure smooth flow between sections.

SECTIONS TO MERGE:
${partialDocs.map((d, i) => `--- Section ${i + 1} ---\n${d}`).join("\n\n")}

Output a single clean Markdown document. Keep all unique information.
`.trim();

// Legacy exports kept for compatibility
export const OVERVIEW_PROMPT = (structure: string, firstChunkCode: string) => COMBINED_PROMPT(structure, firstChunkCode);
export const README_PROMPT = () => "";