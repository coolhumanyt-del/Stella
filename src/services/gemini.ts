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

const GEMINI_API_KEY = "AQ.Ab8RN6J1wmsVA2VeOb1qW5STFMHLp8nm_1A6nkl5LL2gVDJ1Mw";

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nNews Text:\n${rawText}` }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Gemini API error occurred");
  }

  let rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) {
    throw new Error("No response received from Gemini engine.");
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
