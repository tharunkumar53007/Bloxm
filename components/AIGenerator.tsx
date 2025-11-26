
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Loader2, Zap, LayoutTemplate, Layers, Wand2, Fingerprint, Palette, MonitorPlay, Rocket, CheckCircle2 } from 'lucide-react';
import { generateBentoLayout } from '../services/aiService';
import { BlockData, ThemeConfig } from '../types';

interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (blocks: BlockData[], mode: 'replace' | 'append') => void;
  currentTheme: ThemeConfig;
}

const LOADING_STEPS = [
  "CONNECTING_NEURAL_CORE...",
  "PARSING_PERSONA_DATA...",
  "SYNTHESIZING_AESTHETICS...",
  "COMPUTING_GRID_TOPOLOGY...",
  "GENERATING_COPY_ASSETS...",
  "RENDERING_VISUALS...",
  "POLISHING_GLASS_SURFACES...",
  "FINALIZING_BUILD..."
];

const VIBES = [
  { id: 'professional', label: 'Professional', icon: Fingerprint, color: 'from-blue-500 to-indigo-600', accent: 'text-blue-400' },
  { id: 'creative', label: 'Creative', icon: Palette, color: 'from-pink-500 to-rose-500', accent: 'text-pink-400' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: MonitorPlay, color: 'from-cyan-500 to-blue-600', accent: 'text-cyan-400' },
  { id: 'minimalist', label: 'Minimalist', icon: LayoutTemplate, color: 'from-zinc-400 to-zinc-600', accent: 'text-white' },
  { id: 'startup', label: 'Startup', icon: Rocket, color: 'from-emerald-500 to-teal-500', accent: 'text-emerald-400' }
];

const PRESETS = [
  "Software Engineer at Big Tech",
  "Digital Artist & Illustrator",
  "Crypto Trader & Analyst",
  "Indie Game Developer",
  "Travel Photographer",
  "SaaS Founder"
];

export const AIGenerator: React.FC<AIGeneratorProps> = ({ isOpen, onClose, onGenerated, currentTheme }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('professional');
  const [genState, setGenState] = useState<'idle' | 'generating' | 'success'>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setGenState('idle');
      setStepIndex(0);
    }
  }, [isOpen]);

  // Loading Step Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (genState === 'generating') {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [genState]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenState('generating');
    
    try {
        // Minimum visual wait time for "premium" feel (2s)
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000));
        
        const themeContext = `Type: ${currentTheme.type}, Value: ${currentTheme.value}`;
        const generationPromise = generateBentoLayout(prompt, themeContext, selectedVibe);
        
        const [_, blocks] = await Promise.all([minTimePromise, generationPromise]);
        
        // Show success state briefly
        setGenState('success');
        
        setTimeout(() => {
            if (blocks && blocks.length > 0) {
              onGenerated(blocks, mode);
              onClose();
            } else {
                // Should not happen with fallback logic, but just in case
                setGenState('idle');
            }
        }, 1500); 
    } catch (e) {
        setGenState('idle'); // Revert to idle on catastrophe
    }
  };

  const activeVibeObj = VIBES.find(v => v.id === selectedVibe) || VIBES[0];
  const activeGradient = activeVibeObj.color;
  const activeAccent = activeVibeObj.accent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic Keyframes for Custom Animations */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-scanline {
          animation: scanline 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 8s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>

      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity animate-in fade-in duration-500" onClick={onClose} />
      
      {/* Immersive Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl glass-panel rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_-20px_rgba(255,255,255,0.1)] animate-in zoom-in-95 duration-500 border border-white/10 bg-[#09090b]"
      >
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
             <div className={`absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br ${activeGradient} rounded-full blur-[150px] animate-pulse-slow transition-all duration-1000`} />
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
        </div>

        {/* --- LOADING / SUCCESS OVERLAY --- */}
        {(genState === 'generating' || genState === 'success') && (
            <div className="absolute inset-0 z-50 bg-[#09090b]/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl transition-all duration-500">
                
                {genState === 'generating' ? (
                   <div className="relative mb-12 scale-125">
                       {/* Core Glow */}
                       <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r ${activeGradient} blur-[80px] opacity-20 animate-pulse`} />

                       {/* Construction Rings - Quantum Core */}
                       <div className="relative w-32 h-32">
                           {/* Ring 1 - Slow Outer */}
                           <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow" />
                           
                           {/* Ring 2 - Dashed Scanner */}
                           <div className="absolute inset-0 rounded-full border border-white/10 border-dashed animate-spin-reverse" />

                           {/* Ring 3 - Fast Orbit with Particle */}
                           <div className="absolute inset-[-10px] animate-[spin_3s_linear_infinite]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white]" />
                           </div>

                           {/* Ring 4 - Counter Rotation Arc */}
                           <div className="absolute inset-2 rounded-full border-t-2 border-white/20 animate-[spin_2s_linear_infinite]" />

                           {/* Central Processor */}
                           <div className="absolute inset-4 bg-[#000] rounded-full border border-white/10 flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] overflow-hidden">
                               {/* Holographic Scanline */}
                               <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scanline`} />
                               
                               {/* Icon */}
                               <div className="relative z-10 flex flex-col items-center gap-1">
                                   <Sparkles className="w-8 h-8 text-white fill-white/20 animate-pulse" />
                               </div>
                           </div>
                       </div>
                   </div>
                ) : (
                    <div className="relative mb-10 scale-125 animate-in zoom-in duration-500 ease-out">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className={`absolute inset-0 bg-gradient-to-br ${activeGradient} blur-[60px] opacity-40`} />
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-[ping_1s_ease-out_reverse]" />
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] border border-white/20 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[spin_3s_linear_infinite_reverse] opacity-50" />
                                  <CheckCircle2 className="w-12 h-12 text-white drop-shadow-lg" />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="h-16 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-white mb-3 tracking-wider font-mono animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {genState === 'success' ? ">> BUILD_COMPLETE" : `>> ${LOADING_STEPS[stepIndex]}`}
                    </h3>
                    {genState === 'generating' && (
                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-gradient-to-r ${activeGradient} transition-all duration-500`} 
                                style={{ width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- MAIN INTERFACE --- */}
        <div className={`relative z-10 p-6 md:p-10 transition-all duration-500 ${genState !== 'idle' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${activeGradient} flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 shrink-0`}>
                    <Wand2 className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">AI Magic Build</h2>
                    <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 border border-white/5 text-zinc-300 uppercase tracking-wider">Gemini 2.5 Flash</span>
                         <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="space-y-6 md:space-y-8">
                {/* Vibe Selector */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Select Vibe</label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                        {VIBES.map((vibe) => {
                            const isActive = selectedVibe === vibe.id;
                            const Icon = vibe.icon;
                            return (
                                <button
                                    key={vibe.id}
                                    onClick={() => setSelectedVibe(vibe.id)}
                                    className={`
                                        group flex flex-col items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-300 relative overflow-hidden
                                        ${isActive 
                                            ? `bg-white/5 border-white/20 text-white shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)] scale-105 ring-1 ring-white/20` 
                                            : 'bg-black/40 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:border-white/10'
                                        }
                                    `}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                    {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-20`} />}
                                    
                                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-white' : 'opacity-50 group-hover:opacity-80'} transition-all`} />
                                    <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{vibe.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Your Persona</label>
                        <span className={`text-[10px] ${activeAccent} font-medium opacity-80 hidden md:inline`}>Be specific for best results</span>
                    </div>
                    
                    <div className="relative group">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${activeGradient} rounded-2xl opacity-20 group-focus-within:opacity-100 transition duration-700 blur`}></div>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A senior product designer at Google who loves hiking, minimalism, and film photography..."
                            className="relative w-full h-28 md:h-32 bg-[#0c0c0e] border border-white/10 rounded-xl p-4 md:p-5 text-white placeholder:text-zinc-700 focus:outline-none focus:bg-black resize-none transition-all leading-relaxed custom-scrollbar text-sm md:text-base shadow-inner"
                            disabled={genState !== 'idle'}
                            autoFocus
                        />
                    </div>
                    {/* Presets - Scrollable on mobile */}
                    <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar md:flex-wrap">
                        {PRESETS.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setPrompt(preset)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-zinc-400 hover:text-white transition-all font-medium whitespace-nowrap"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col md:flex-row items-center gap-4 pt-4 md:pt-6 border-t border-white/5">
                    {/* Mode Toggle */}
                    <div className="bg-black/60 rounded-xl p-1.5 flex border border-white/5 w-full md:w-auto">
                        <button 
                            onClick={() => setMode('replace')}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'replace' ? 'bg-zinc-800 text-white shadow-md ring-1 ring-white/10' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Replace
                        </button>
                        <button 
                            onClick={() => setMode('append')}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'append' ? 'bg-zinc-800 text-white shadow-md ring-1 ring-white/10' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Append
                        </button>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                        className={`
                            w-full md:flex-1 py-3.5 md:py-4 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 group relative overflow-hidden
                            bg-gradient-to-r ${activeGradient} hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <Sparkles className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
                        <span className="relative z-10">Generate Site</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};