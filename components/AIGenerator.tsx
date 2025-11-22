import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { generateBentoLayout } from '../services/aiService';
import { BlockData, ThemeConfig } from '../types';

interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (blocks: BlockData[]) => void;
  currentTheme: ThemeConfig;
}

const LOADING_CAPTIONS = [
  "Analyzing your vibe...",
  "Consulting design algorithms...",
  "Constructing the grid...",
  "Polishing pixels...",
  "Injecting personality...",
  "Aligning aesthetics...",
  "Finalizing the magic..."
];

export const AIGenerator: React.FC<AIGeneratorProps> = ({ isOpen, onClose, onGenerated, currentTheme }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(LOADING_CAPTIONS[0]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      let index = 0;
      setCurrentCaption(LOADING_CAPTIONS[0]); 
      interval = setInterval(() => {
        index = (index + 1) % LOADING_CAPTIONS.length;
        setCurrentCaption(LOADING_CAPTIONS[index]);
      }, 800); 
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a descriptive string of the theme for the AI
    const themeContext = `Type: ${currentTheme.type}, Value: ${currentTheme.value}`;
    
    const generationPromise = generateBentoLayout(prompt, themeContext);
    
    const [_, blocks] = await Promise.all([minTimePromise, generationPromise]);
    
    setIsGenerating(false);
    if (blocks.length > 0) {
      onGenerated(blocks);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg glass-panel rounded-[2.5rem] p-8 border border-white/10 shadow-2xl shadow-indigo-900/20 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full liquid-btn text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center mb-4 shadow-xl shadow-purple-500/40 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">AI Magic Build</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-xs">Describe yourself, and we'll liquify a personalized grid layout instantly.</p>
        </div>

        <div className="space-y-6">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'A minimalist photographer based in Tokyo who loves film cameras' or 'A cyberpunk react developer'"
            className="w-full h-36 bg-black/20 border border-white/10 rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:bg-black/40 focus:border-indigo-500/50 resize-none shadow-inner transition-all"
            disabled={isGenerating}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse min-w-[160px] text-left">{currentCaption}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Site
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};