import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Zap, LayoutTemplate, Layers } from 'lucide-react';
import { generateBentoLayout } from '../services/aiService';
import { BlockData, ThemeConfig } from '../types';

interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (blocks: BlockData[], mode: 'replace' | 'append') => void;
  currentTheme: ThemeConfig;
}

const LOADING_CAPTIONS = [
  "Dreaming up concepts...",
  "Aligning the grid...",
  "Painting pixels...",
  "Writing witty copy...",
  "Injecting personality...",
  "Polishing glass...",
  "Finalizing aesthetics..."
];

const PRESETS = [
  "Software Engineer Portfolio",
  "Digital Artist Showcase",
  "Minimalist Blogger",
  "Crypto Trader & Analyst",
  "Indie Game Developer",
  "Travel Photographer"
];

export const AIGenerator: React.FC<AIGeneratorProps> = ({ isOpen, onClose, onGenerated, currentTheme }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(LOADING_CAPTIONS[0]);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      let index = 0;
      setCurrentCaption(LOADING_CAPTIONS[0]); 
      interval = setInterval(() => {
        index = (index + 1) % LOADING_CAPTIONS.length;
        setCurrentCaption(LOADING_CAPTIONS[index]);
      }, 1200); 
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Artificial delay for UX (so user sees the 'thinking' state)
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    const themeContext = `Type: ${currentTheme.type}, Value: ${currentTheme.value}`;
    const generationPromise = generateBentoLayout(prompt, themeContext);
    
    const [_, blocks] = await Promise.all([minTimePromise, generationPromise]);
    
    setIsGenerating(false);
    
    if (blocks && blocks.length > 0 && blocks[0].title !== 'Generation Error') {
      onGenerated(blocks, mode);
      onClose();
      setPrompt(''); // Clear prompt on success
    } else {
        // Handle error visually
        alert("AI Generation failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-xl glass-panel rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_60px_-15px_rgba(79,70,229,0.3)] animate-in zoom-in-95 duration-300 bg-[#09090b]/90">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/25 animate-pulse-slow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">AI Magic Build</h2>
          <p className="text-zinc-400 text-sm font-medium">Describe your dream site, and we'll build it.</p>
        </div>

        <div className="space-y-6">
          
          {/* Input Area */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur"></div>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A cyberpunk creative director based in Tokyo..."
                className="relative w-full h-32 bg-black border border-white/10 rounded-xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:bg-zinc-950 resize-none transition-all leading-relaxed"
                disabled={isGenerating}
                autoFocus
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Quick Start Presets</label>
            <div className="flex flex-wrap gap-2">
                {PRESETS.map(preset => (
                    <button
                        key={preset}
                        onClick={() => setPrompt(preset)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-xs text-zinc-300 hover:text-white transition-all active:scale-95"
                    >
                        {preset}
                    </button>
                ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="bg-white/5 rounded-xl p-1 flex gap-1 border border-white/5">
              <button 
                onClick={() => setMode('replace')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'replace' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                  <LayoutTemplate className="w-3 h-3" />
                  Replace All
              </button>
              <button 
                onClick={() => setMode('append')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'append' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                  <Layers className="w-3 h-3" />
                  Append
              </button>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait hover:bg-zinc-200 active:scale-[0.98] shadow-lg shadow-white/5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="animate-pulse">{currentCaption}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-black" />
                Generate Layout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};