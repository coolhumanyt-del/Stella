import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TopbandItem {
  text: string;
  wordCount: number;
}

export interface NewsScriptResponse {
  anchorScript: string;
  topbands: string[];
}

export async function generateBroadcastContent(
  rawData: string,
  apiKey: string
): Promise<NewsScriptResponse> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("API Key ਦਰਜ ਨਹੀਂ ਕੀਤੀ ਗਈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ Gemini API Key ਪਾਓ।");
  }

  if (!rawData || !rawData.trim()) {
    throw new Error("ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਰਾਅ ਡੇਟਾ (Raw News) ਦਰਜ ਕਰੋ।");
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const prompt = `
ਤੁਸੀਂ ਇੱਕ ਸੀਨੀਅਰ ਟੀਵੀ ਨਿਊਜ਼ ਆਊਟਪੁੱਟ ਪ੍ਰੋਡਿਊਸਰ ਅਤੇ ਸਕ੍ਰਿਪਟ ਰਾਈਟਰ ਹੋ। 
ਹੇਠਾਂ ਦਿੱਤੇ ਰਾਅ ਡੇਟਾ (Raw News Data) ਦੇ ਆਧਾਰ 'ਤੇ ਟੀਵੀ ਬ੍ਰੌਡਕਾਸਟ ਸਮੱਗਰੀ ਤਿਆਰ ਕਰੋ:

ਨਿਯਮ:
1. ANCHOR SCRIPT (ਐਂਕਰ ਸਕ੍ਰਿਪਟ):
- ਪੱਤਰਕਾਰੀ ਸ਼ੈਲੀ ਵਿੱਚ ਦਮਦਾਰ, ਸਪਸ਼ਟ ਅਤੇ ਟੀਵੀ ਐਂਕਰ ਦੇ ਪੜ੍ਹਨ ਯੋਗ ਸਕ੍ਰਿਪਟ ਲਿਖੋ।
- ਸਭ ਤੋਂ ਜ਼ਰੂਰੀ: ਸਕ੍ਰਿਪਟ ਵਿੱਚ ਕਿਤੇ ਵੀ ਫੁੱਲ ਸਟੌਪ (ਜਿਵੇਂ . ਜਾਂ ।) ਬਿਲਕੁਲ ਨਹੀਂ ਲਗਾਉਣਾ। 
- ਹਰ ਵਾਕ ਦੇ ਅੰਤ ਵਿੱਚ ਅਤੇ ਹਰ ਕੁਦਰਤੀ ਵਿਰਾਮ/ਸਾਹ ਲੈਣ ਦੀ ਥਾਂ ਠੀਕ ਤਿੰਨ ਡੌਟਸ ( ... ) ਲਗਾਏ ਜਾਣ।

2. TOPBANDS (5 ਸੁਤੰਤਰ ਟੌਪਬੈਂਡ ਲਾਈਨਾਂ):
- ਬਿਲਕੁਲ 5 ਟੌਪਬੈਂਡ (Ticker/Topband) ਲਾਈਨਾਂ ਬਣਾਓ।
- ਹਰੇਕ ਟੌਪਬੈਂਡ ਲਾਈਨ ਵਿੱਚ ਬਿਲਕੁਲ 5 ਤੋਂ 6 ਸ਼ਬਦ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ (ਨਾ 4 ਨਾ 7, ਠੀਕ 5 ਜਾਂ 6 ਸ਼ਬਦ)।
- ਹਰ ਲਾਈਨ ਆਪਣੇ ਆਪ ਵਿੱਚ ਸੰਪੂਰਨ, ਸਪਸ਼ਟ ਅਤੇ ਸੁਤੰਤਰ (Standalone) ਹੋਵੇ।

ਕੱਚੀ ਖ਼ਬਰ (Raw Data):
"""
${rawData}
"""

ਆਊਟਪੁੱਟ ਸਿਰਫ਼ ਇਸ ਵੈਧ JSON ਸਕੀਮਾ ਵਿੱਚ ਦਿਓ:
{
  "anchorScript": "ਸਕ੍ਰਿਪਟ ਇੱਥੇ ... ਹਰ ਪੌਜ਼ 'ਤੇ ਤਿੰਨ ਡੌਟਸ ... ਕੋਈ ਫੁੱਲ ਸਟੌਪ ਨਹੀਂ ...",
  "topbands": [
    "ਪਹਿਲਾ ਸੁਤੰਤਰ ਟੌਪਬੈਂਡ ਪੰਜ ਛੇ ਸ਼ਬਦ",
    "ਦੂਜਾ ਟੌਪਬੈਂਡ ਪੰਜ ਜਾਂ ਛੇ ਸ਼ਬਦ",
    "ਤੀਜੀ ਸੁਤੰਤਰ ਖ਼ਬਰ ਲਾਈਨ ਇੱਥੇ",
    "ਚੌਥਾ ਅਹਿਮ ਪੁਆਇੰਟ ਬ੍ਰੌਡਕਾਸਟ ਟੌਪਬੈਂਡ",
    "ਪੰਜਵੀਂ ਲਾਈਨ ਪੰਜ ਤੋਂ ਛੇ ਸ਼ਬਦ"
  ]
}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const parsedData = JSON.parse(responseText) as NewsScriptResponse;

  // ਕਲਾਇੰਟ-ਸਾਈਡ ਸੁਰੱਖਿਆ: ਜੇਕਰ ਮਾਡਲ ਨੇ ਕਿਤੇ ਭੁੱਲ ਕੇ ਫੁੱਲ-ਸਟਾਪ ਲਗਾ ਵੀ ਦਿੱਤਾ ਹੋਵੇ ਤਾਂ ਉਸਨੂੰ 3 ਡੌਟਸ ਵਿੱਚ ਬਦਲੋ
  const sanitizedScript = parsedData.anchorScript
    .replace(/[।.]+/g, " ... ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    anchorScript: sanitizedScript,
    topbands: parsedData.topbands || [],
  };
}
