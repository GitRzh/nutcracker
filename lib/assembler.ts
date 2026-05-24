import { generateText } from "./groq";
import { MERGE_CHUNKS_PROMPT } from "./prompts";

export async function assembleApiDocs(partialDocs: string[]): Promise<string> {
  if (partialDocs.length === 1) return partialDocs[0];

  // If small enough, merge in one call
  if (partialDocs.join("\n").length < 25000) {
    return await generateText(MERGE_CHUNKS_PROMPT(partialDocs));
  }

  // Otherwise merge in pairs
  const merged: string[] = [];
  for (let i = 0; i < partialDocs.length; i += 2) {
    if (i + 1 < partialDocs.length) {
      const result = await generateText(MERGE_CHUNKS_PROMPT([partialDocs[i], partialDocs[i + 1]]));
      merged.push(result);
    } else {
      merged.push(partialDocs[i]);
    }
  }

  return assembleApiDocs(merged);
}

export function buildFinalOutput(readme: string, apiDocs: string, overview: any): string {
  return [
    readme,
    "\n\n---\n\n",
    "# API & Function Reference\n\n",
    apiDocs
  ].join("");
}
