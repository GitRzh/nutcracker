const MODEL = "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

function getKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set in .env.local");
  return key;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function query(prompt: string, json = false, retries = 3): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.3,
      ...(json && { response_format: { type: "json_object" } }),
    }),
  });

  if (res.status === 429 && retries > 0) {
    // Parse retry delay from response if available, default to 10s
    const err = await res.json().catch(() => ({}));
    const retryAfter = err?.error?.message?.match(/in (\d+(\.\d+)?)s/)?.[1];
    const waitMs = retryAfter ? Math.ceil(parseFloat(retryAfter) * 1000) + 500 : 10000;
    await sleep(waitMs);
    return query(prompt, json, retries - 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateText(prompt: string): Promise<string> {
  return query(prompt);
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const text = await query(prompt, true);
  const clean = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(clean) as T;
}