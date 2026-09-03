import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

export interface GraphicSet {
  header: string;
  pointers: string[];
}

export interface AnchorLinkResult {
  anchorLink: string;
  pointers: string[];
  location: string;
  bytePerson: string;
  breakingLines: string[];
  graphics: GraphicSet[];
  headlines: string;
}

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please ensure it is set in the environment.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    const errorMessage = e.message || String(e);
    const isQuotaError = errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota");
    
    if (retries > 0 && isQuotaError) {
      console.warn(`Quota exceeded, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    
    if (isQuotaError) {
      throw new Error("Daily limit reached or too many requests. Please wait a few minutes and try again.");
    }
    if (errorMessage.includes("API key not valid")) {
      throw new Error("Invalid API key. Please check your configuration.");
    }
    if (e instanceof SyntaxError) {
      throw new Error("Failed to parse the AI response. Please try again.");
    }

    throw new Error(errorMessage || "Failed to generate content. Please try again.");
  }
}

export async function generateAnchorLink(rawText: string, graphicsCount: number): Promise<AnchorLinkResult> {
  const ai = getAI();

  const makeRequest = async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Convert the following raw text into a TV anchor link in Punjabi. 
          
Requirements:
1. The output MUST be in Punjabi.
2. Write like a professional TV producer. Use conversational/colloquial Punjabi (ਬੋਲਚਾਲ ਵਾਲੀ ਭਾਸ਼ਾ) that is easy for common people to understand.
3. IMPORTANT: Always use digits for numbers (e.g., 1, 2, 3, 10, 50). Do NOT write numbers in Punjabi words (e.g., do NOT use ਇੱਕ, ਦੋ, ਤਿੰਨ).
4. The anchor link MUST be a single, continuous paragraph.
5. Every single sentence or logical break in the anchor link paragraph MUST end with three dots (...).
6. Provide exactly 4 pointers related to the content. Each pointer MUST NOT exceed 6 words. These should be simple text, no bullets, no bolding.
7. Provide the location of the event. Simple text, no header, no bolding.
8. Provide the name and designation/details of the person giving the byte (interview). Simple text, no header, no bolding.
9. Provide exactly 7 lines of "Breaking" (ਬ੍ਰੇਕਿੰਗ) based on the raw text. 
   - Each line MUST have between 7 to 9 words to ensure the sentence is complete. 
   - Write like a professional producer.
   - No headers, no bolding, just simple text lines.
10. Provide exactly ${graphicsCount} sets of "Graphics".
    - Each set MUST have exactly 6 lines.
    - Line 1: Header (No "Header:" label, no emojis).
    - Lines 2-6: 5 pointers related to the news.
    - IMPORTANT: Include as much information as possible in these pointers. They can be longer and more detailed.
    - NO bullets (*, -, dot, numbers). Plain text only.
11. Provide "Headlines" as a single continuous paragraph based on the "Breaking" content.
    - These MUST be high-impact "Punch Lines" in the style of major news channels like ABP News.
    - Every headline point in the paragraph MUST end with exactly three dots (...).
    - The entire paragraph should contain 3 to 4 such points joined together.
    - Use dramatic and catchy language that grabs attention.
    - No headers, no bolding, just simple text.

Raw Text:
${rawText}` }],
        },
      ],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            anchorLink: {
              type: Type.STRING,
              description: "The Punjabi anchor link paragraph where every line ends with ...",
            },
            pointers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 4 simple text pointers",
            },
            location: {
              type: Type.STRING,
              description: "The location of the event",
            },
            bytePerson: {
              type: Type.STRING,
              description: "Name and designation of the person giving the byte",
            },
            breakingLines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 7 lines of breaking content, each 7-9 words long",
            },
            graphics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  header: { type: Type.STRING },
                  pointers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    minItems: 5,
                    maxItems: 5,
                  }
                },
                required: ["header", "pointers"]
              },
              description: "Array of graphic sets",
            },
            headlines: {
              type: Type.STRING,
              description: "Catchy headlines as a single paragraph where each part ends with ...",
            }
          },
          required: ["anchorLink", "pointers", "location", "bytePerson", "breakingLines", "graphics", "headlines"],
        },
      },
    });

    if (!response.text) {
      throw new Error("The AI model returned an empty response. Please try again.");
    }

    return JSON.parse(response.text) as AnchorLinkResult;
  };

  return retry(makeRequest);
}


