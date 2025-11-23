
import React from 'react';
import { X, Palette, Check } from 'lucide-react';
import { ThemeConfig } from '../types';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (theme: ThemeConfig) => void;
  currentTheme?: ThemeConfig;
}

const PRESETS: { name: string, config: ThemeConfig }[] = [
  { 
    name: 'Aesthetic Green', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #022c22, #064e3b, #0f172a)' } 
  },
  { 
    name: 'Titanium', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #1f2937, #4b5563, #030712)' } 
  },
  { 
    name: 'Northern Lights', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #0f766e, #0e7490, #020617)' } 
  },
  { 
    name: 'Midnight Rose', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #831843, #be185d, #020617)' } 
  },
  { 
    name: 'Electric Violet', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #4c1d95, #7c3aed, #0f172a)' } 
  },
  { 
    name: 'Golden Hour', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #422006, #713f12, #000000)' } 
  },
  { 
    name: 'Royal Amethyst', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #2e1065, #581c87, #000000)' } 
  },
  { 
    name: 'Crimson Moon', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #450a0a, #7f1d1d, #000000)' } 
  },
  { 
    name: 'Deep Ocean', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #172554)' } 
  },
  { 
    name: 'Cotton Candy', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #ec4899, #8b5cf6, #06b6d4)' } 
  },
  { 
    name: 'Obsidian', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #27272a, #09090b)' } 
  },
   { 
    name: 'Midnight', 
    config: { type: 'gradient', value: 'linear-gradient(to bottom right, #000000, #09090b)' } 
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose, onSelect, currentTheme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg glass-panel rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-md">
            <Palette className="w-6 h-6 text-emerald-400" />
            Theme Gallery
          </h3>
          <button onClick={onClose} className="p-2 liquid-btn rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => { onSelect(preset.config); onClose(); }}
              className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg"
            >
              <div 
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" 
                style={{ background: preset.config.value }} 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white/90 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md border border-white/5">
                {preset.name}
              </span>
              {currentTheme?.value === preset.config.value && (
                 <div className="absolute top-2 right-2 bg-emerald-500/20 backdrop-blur-md rounded-full p-1 border border-emerald-500/50">
                    <Check className="w-3 h-3 text-emerald-400" />
                 </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
