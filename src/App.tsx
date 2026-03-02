import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Wand2, 
  Loader2, 
  Download, 
  AlertCircle,
  ArrowRight,
  ChevronRight,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  generateImage, 
  editImage, 
} from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setStatus('Generating image...');
    try {
      const result = await generateImage(prompt);
      setImage(result);
      setHistory(prev => [result, ...prev].slice(0, 5));
      setStatus('Image generated!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!image || !editPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setStatus('Editing image...');
    try {
      const result = await editImage(image, editPrompt);
      setImage(result);
      setHistory(prev => [result, ...prev].slice(0, 5));
      setStatus('Image edited!');
      setEditPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to edit image');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Visionary</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ImageIcon className="w-4 h-4" />
              <h2 className="text-sm font-medium uppercase tracking-widest">Create Image</h2>
            </div>
            
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none placeholder:text-zinc-600"
              />
              <button
                onClick={handleGenerateImage}
                disabled={loading || !prompt.trim()}
                className="absolute bottom-3 right-3 p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading && status.includes('image') ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </section>

          <AnimatePresence>
            {image && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-blue-400">
                  <Wand2 className="w-4 h-4" />
                  <h2 className="text-sm font-medium uppercase tracking-widest">Refine Image</h2>
                </div>
                
                <div className="relative group">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="E.g., 'Add a sunset', 'Make it cinematic'..."
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
                  />
                  <button
                    onClick={handleEditImage}
                    disabled={loading || !editPrompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 disabled:opacity-50 transition-all"
                  >
                    {loading && status.includes('Editing') ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>


              </motion.section>
            )}
          </AnimatePresence>

          {/* Status & Error */}
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center gap-3 text-zinc-400 text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{status}</span>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-square lg:aspect-[4/3] bg-zinc-900/30 rounded-[32px] border border-white/5 overflow-hidden group">
            <AnimatePresence mode="wait">
              {image ? (
                <motion.div
                  key="image-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative"
                >
                  <img
                    src={image}
                    alt="Generated"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = image;
                          link.download = 'visionary-image.png';
                          link.click();
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Save Image
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">No creation yet</p>
                    <p className="text-xs">Enter a prompt to start your journey</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History */}
          {history.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <History className="w-4 h-4" />
                <h2 className="text-xs font-medium uppercase tracking-widest">Recent Generations</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {history.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImage(img)}
                    className={cn(
                      "shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all",
                      image === img ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`History ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500 text-xs">
          <p>© 2026 Visionary Studio. Powered by Gemini 2.5 Flash Image.</p>
          <div className="flex items-center gap-8">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Billing Docs</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

