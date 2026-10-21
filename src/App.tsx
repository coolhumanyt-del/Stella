import React, { useState, useEffect } from "react";
import { generateBroadcastContent } from "./gemini";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [rawData, setRawData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anchorScript, setAnchorScript] = useState<string>("");
  const [topbands, setTopbands] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<number>(18);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ API Key ਸੇਵ ਰੱਖਣ ਲਈ
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await generateBroadcastContent(rawData, apiKey);
      setAnchorScript(res.anchorScript);
      setTopbands(res.topbands);
    } catch (err: any) {
      setError(err.message || "ਡਾਟਾ ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਕੋਈ ਸਮੱਸਿਆ ਆਈ ਹੈ।");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const countWords = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide text-white">
            NEWSROOM SCRIPT & TOPBAND GENERATOR
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="Gemini API Key ਇੱਥੇ ਪਾਓ"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-52 md:w-64"
          />
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Input Data */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-300">
                ਰਾਅ ਡੇਟਾ (Raw News Data)
              </label>
              <button
                onClick={() => setRawData("")}
                className="text-xs text-slate-400 hover:text-red-400"
              >
                ਸਾਫ਼ ਕਰੋ
              </button>
            </div>

            <textarea
              rows={16}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="ਕਿਸੇ ਵੀ ਪ੍ਰੈੱਸ ਨੋਟ, ਏਜੰਸੀ ਫੀਡ ਜਾਂ ਕੱਚੀ ਖ਼ਬਰ ਦਾ ਡੇਟਾ ਇੱਥੇ ਪੇਸਟ ਕਰੋ..."
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono resize-none leading-relaxed"
            />

            {error && (
              <div className="mt-3 p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !rawData.trim()}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ਸਕ੍ਰਿਪਟ ਅਤੇ ਟੌਪਬੈਂਡ ਤਿਆਰ ਹੋ ਰਹੇ ਹਨ...
                </>
              ) : (
                "ਸਕ੍ਰਿਪਟ ਤੇ 5 ਟੌਪਬੈਂਡ ਬਣਾਓ"
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Broadcast Outputs */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Topbands Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  TOPBAND (5-6 ਸ਼ਬਦ)
                </span>
                <span className="text-xs text-slate-400">5 ਸੁਤੰਤਰ ਲਾਈਨਾਂ</span>
              </div>

              {topbands.length > 0 && (
                <button
                  onClick={() =>
                    copyToClipboard(topbands.join("\n"), "all-topbands")
                  }
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-200 border border-slate-700"
                >
                  {copiedKey === "all-topbands" ? "ਸਾਰੇ ਕਾਪੀ ਹੋ ਗਏ!" : "Copy All Topbands"}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {topbands.length > 0 ? (
                topbands.map((line, idx) => {
                  const words = countWords(line);
                  const isPerfect = words >= 5 && words <= 6;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 px-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-xs font-mono font-bold text-slate-500 w-4">
                          {idx + 1}.
                        </span>
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {line}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
