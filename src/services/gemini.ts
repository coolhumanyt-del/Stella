export interface GraphicsItem {
  header: string;
  pointers: string[];
}

export interface AnchorLinkResult {
  anchorLink: string;
  pointers: string[];
  location: string;
  bytePerson: string;
  breakingLines: string[];
  graphics: GraphicsItem[];
  headlines: string;
}

const OPENAI_API_KEY = "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";

export async function generateAnchorLink(rawText: string, graphicsCount: number): Promise<AnchorLinkResult> {
  const systemPrompt = `You are a veteran television news executive and senior news producer for a professional Punjabi news channel. Analyze the raw news text and output a valid JSON object ONLY with no extra text or markdown formatting. 
CRITICAL RULE: All text content in the JSON fields MUST be written in professional, journalistic, idiomatic Punjabi (Gurmukhi script).

Format:
{
  "anchorLink": "ਖ਼ਬਰ ਦੀ ਸ਼ੁਰੂਆਤੀ ਐਂਕਰ ਲਿੰਕ ਸਕ੍ਰਿਪਟ (2-3 ਵਾਕ).",
  "pointers": ["ਪੁਆਇੰਟਰ 1", "ਪੁਆਇੰਟਰ 2", "ਪੁਆਇੰਟਰ 3"],
  "location": "ਸਥਾਨ (ਜਵੇਂ ਕਿ ਚੰਡੀਗੜ੍ਹ / ਨਵੀਂ ਦਿੱਲੀ)",
  "bytePerson": "ਬਾਈਟ ਦੇਣ ਵਾਲੇ ਦਾ ਨਾਮ ਅਤੇ ਅਹੁਦਾ",
  "breakingLines": ["ਬਰੇਕਿੰਗ ਲਾਈਨ 1", "ਬਰੇਕਿੰਗ ਲਾਈਨ 2"],
  "graphics": [
    { "header": "ਗ੍ਰਾਫਿਕ ਸਿਰਲੇਖ", "pointers": ["ਬੁੱਲਟ 1", "ਬੁੱਲਟ 2"] }
  ],
  "headlines": "ਖ਼ਬਰਾਂ ਦੀਆਂ ਮੁੱਖ ਸੁਰਖੀਆਂ।"
}
Ensure 'graphics' array has exactly ${graphicsCount} items.`;

  // CORS ਰੁਕਾਵਟ ਨੂੰ ਹਟਾਉਣ ਲਈ ਪ੍ਰੌਕਸੀ ਰਾਹੀਂ ਰਿਕਵੈਸਟ ਭੇਜਣਾ
  const proxyUrl = "https://corsproxy.io/?";
  const targetUrl = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rawText }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "API error occurred");
  }

  let rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("No response received from AI engine.");
  }

  if (rawContent.startsWith("```")) {
    rawContent = rawContent.replace(/^```json?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(rawContent) as AnchorLinkResult;
  } catch (e) {
    throw new Error("Failed to parse AI response structure.");
  }
}
