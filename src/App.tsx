/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Trash2, 
  MapPin, 
  User, 
  Zap, 
  Layout, 
  AlertCircle, 
  RotateCcw,
  Newspaper
} from 'lucide-react';
import { generateAnchorLink, AnchorLinkResult } from './services/gemini';
import { cn } from './lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">Something went wrong</h1>
            <p className="text-gray-600">{this.state.error?.message || "An unexpected error occurred."}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StellaApp />
    </ErrorBoundary>
  );
}

function StellaApp() {
  const [rawText, setRawText] = useState('');
  const [graphicsCount, setGraphicsCount] = useState(1);
  const [result, setResult] = useState<AnchorLinkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedGraphics, setCopiedGraphics] = useState(false);
  const [copiedHeadlines, setCopiedHeadlines] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'missing'>('checking');

useEffect(() => {
    setApiKeyStatus('ok');
  }, []);

  const handleGenerate = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateAnchorLink(rawText, graphicsCount);
      setResult(data);
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRawText('');
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = [
      result.anchorLink,
      '',
      ...result.pointers,
      '',
      result.location,
      '',
      result.bytePerson,
      '',
      ...result.breakingLines
    ].join('\n');
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyGraphics = () => {
    if (!result) return;
    const graphicsText = result.graphics.map(g => [g.header, ...g.pointers, ''].join('\n')).join('\n');
    navigator.clipboard.writeText(graphicsText);
    setCopiedGraphics(true);
    setTimeout(() => setCopiedGraphics(false), 2000);
  };

  const handleCopyHeadlines = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.headlines);
    setCopiedHeadlines(true);
    setTimeout(() => setCopiedHeadlines(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-none">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-black">STELLA</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          
          {/* Input Section */}
          <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select 
                    value={graphicsCount}
                    onChange={(e) => setGraphicsCount(Number(e.target.value))}
                    className="bg-white border border-black text-xs font-bold px-2 py-1 rounded-none focus:ring-1 focus:ring-black outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Graphics</option>
                    ))}
                  </select>
                  {apiKeyStatus === 'missing' && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> API Key Missing
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleClear}
                  className="text-gray-400 hover:text-black transition-colors p-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                  title="Reset All"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            <div className="relative group">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder=""
                maxLength={10000}
                className="w-full h-[300px] p-6 bg-white border border-black rounded-none shadow-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none text-lg leading-relaxed placeholder:text-gray-300 overflow-y-auto"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {rawText.length} / 10000
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !rawText.trim()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-none font-bold transition-all",
                    loading || !rawText.trim() 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-black text-white hover:bg-gray-800 active:translate-y-0"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Output Section 1: Scripts */}
          <section className="space-y-4">
            <div className="flex items-center justify-end h-8">
              {result && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-bold text-black hover:bg-gray-100 px-3 py-1.5 rounded-none transition-all border border-black"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleGenerate}
                    className="p-1.5 text-gray-400 hover:text-black transition-colors"
                    title="Regenerate"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-[300px] max-h-[300px] bg-white border border-black rounded-none shadow-none overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {!result && !loading && !error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  />
                )}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12"
                  >
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4"
                  >
                    <div className="w-12 h-12 bg-gray-50 text-black rounded-none flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <p className="text-black font-medium">{error}</p>
                    <button 
                      onClick={handleGenerate}
                      className="text-sm font-bold text-gray-500 hover:text-black underline underline-offset-4"
                    >
                      Try again
                    </button>
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 space-y-6 overflow-y-auto"
                  >
                    {/* Anchor Link Paragraph */}
                    <div className="space-y-2">
                      <p className="text-lg font-medium leading-relaxed text-black">
                        {result.anchorLink}
                      </p>
                    </div>

                    {/* Pointers Section */}
                    <div className="space-y-1 pt-4 border-t border-gray-100">
                      {result.pointers.map((pointer, i) => (
                        <p key={i} className="text-base text-gray-700 leading-snug">
                          {pointer}
                        </p>
                      ))}
                    </div>

                    {/* Location & Byte Section */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <p className="text-base text-gray-700">{result.location}</p>
                      <p className="text-base text-gray-700 italic">{result.bytePerson}</p>
                    </div>

                    {/* Breaking Section */}
                    <div className="pt-4 border-t border-gray-100 space-y-1">
                      {result.breakingLines.map((line, i) => (
                        <p key={i} className="text-base text-black font-medium">
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Output Section 2: Graphics */}
          <section className="space-y-4">
            <div className="flex items-center justify-end h-8">
              {result && (
                <button 
                  onClick={handleCopyGraphics}
                  className="flex items-center gap-1.5 text-xs font-bold text-black hover:bg-gray-100 px-3 py-1.5 rounded-none transition-all border border-black"
                >
                  {copiedGraphics ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedGraphics ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="min-h-[300px] max-h-[300px] bg-white border border-black rounded-none shadow-none overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {!result && !loading && !error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  />
                )}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12"
                  >
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 space-y-6 overflow-y-auto"
                  >
                    {result.graphics.map((graphic, idx) => (
                      <div key={idx} className={cn("space-y-1", idx > 0 && "pt-6 border-t border-gray-100")}>
                        <p className="text-lg font-black uppercase tracking-tight text-black mb-2">
                          {graphic.header}
                        </p>
                        {graphic.pointers.map((p, i) => (
                          <p key={i} className="text-base text-gray-800 leading-tight">
                            {p}
                          </p>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Output Section 3: Headlines */}
          <section className="space-y-4">
            <div className="flex items-center justify-end h-8">
              {result && (
                <button 
                  onClick={handleCopyHeadlines}
                  className="flex items-center gap-1.5 text-xs font-bold text-black hover:bg-gray-100 px-3 py-1.5 rounded-none transition-all border border-black"
                >
                  {copiedHeadlines ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHeadlines ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="min-h-[300px] max-h-[300px] bg-white border border-black rounded-none shadow-none overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {!result && !loading && !error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  />
                )}

                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12"
                  >
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 space-y-4 overflow-y-auto"
                  >
                    <p className="text-lg font-black text-black leading-relaxed">
                      {result.headlines}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Removed */}
    </div>
  );
}
