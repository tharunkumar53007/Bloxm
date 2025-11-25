
import React, { useState } from 'react';
import { LayoutGrid, Check, Share2, Sparkles, Palette, Type, Image as ImageIcon, Map, RefreshCw, Trash2, Copy, X, List } from 'lucide-react';
import { BlockType } from '../types';

interface EditToolbarProps {
  isEditing: boolean;
  toggleEdit: () => void;
  addBlock: (type: BlockType) => void;
  onOpenAI: () => void;
  onOpenTheme: () => void;
  onShare: () => void;
  isSharedMode?: boolean;
  onRemix?: () => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  onBulkDuplicate?: () => void;
}

export const EditToolbar: React.FC<EditToolbarProps> = ({ 
  isEditing, 
  toggleEdit, 
  addBlock, 
  onOpenAI, 
  onOpenTheme,
  onShare,
  isSharedMode = false,
  onRemix,
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  onBulkDuplicate
}) => {
  const [justCopied, setJustCopied] = useState(false);

  const handleShareClick = () => {
    onShare();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  // Bulk Action Mode
  if (isEditing && selectedCount > 0) {
    return (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90vw] animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="flex items-center gap-3 p-3 rounded-full glass-panel shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] border-emerald-500/30 bg-emerald-900/20 backdrop-blur-2xl">
            <div className="px-4 text-emerald-400 font-bold text-sm flex items-center gap-2 border-r border-emerald-500/20 pr-4 mr-1 animate-in slide-in-from-left-4 fade-in duration-300">
                <Check className="w-4 h-4" />
                {selectedCount} Selected
            </div>

            <button 
                onClick={onBulkDuplicate}
                className="p-3 rounded-full liquid-btn text-zinc-200 hover:text-emerald-400 hover:bg-emerald-500/20 hover:scale-110"
                title="Duplicate Selected"
            >
                <Copy className="w-5 h-5" />
            </button>

            <button 
                onClick={onBulkDelete}
                className="p-3 rounded-full liquid-btn text-zinc-200 hover:text-red-400 hover:bg-red-500/20 hover:scale-110"
                title="Delete Selected"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button 
                onClick={onClearSelection}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-all active:scale-95"
            >
                <X className="w-4 h-4" />
                Cancel
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90vw] transition-all duration-500" id="toolbar-container">
      <div className="flex items-center gap-3 p-3 rounded-full glass-panel shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] overflow-x-auto no-scrollbar border border-white/10 backdrop-blur-2xl">
        
        {!isEditing ? (
          <>
            {isSharedMode ? (
              <button 
                onClick={onRemix}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all whitespace-nowrap hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Remix This Grid</span>
              </button>
            ) : (
              <button 
                id="tutorial-edit-btn"
                onClick={toggleEdit}
                className="flex items-center gap-2 px-6 py-3 rounded-full liquid-btn text-zinc-100 font-medium whitespace-nowrap hover:text-white"
              >
                <LayoutGrid className="w-5 h-5" />
                <span>Edit Hub</span>
              </button>
            )}
            
            <button 
              id="tutorial-share-btn"
              onClick={handleShareClick}
              className={`flex items-center gap-2 px-5 py-3 rounded-full liquid-btn transition-all ${justCopied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 scale-105' : 'text-zinc-300 hover:text-white'}`}
              title="Share Layout"
            >
              {justCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              {justCopied && <span className="text-xs font-medium animate-in fade-in slide-in-from-left-2 duration-300">Copied</span>}
            </button>
          </>
        ) : (
          <>
             {/* AI Magic Button */}
             <button 
                id="tutorial-ai-btn"
                onClick={onOpenAI}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all mr-2 whitespace-nowrap border border-white/10 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="hidden md:inline">Magic Build</span>
              </button>

             {/* Theme Button */}
             <button 
                id="tutorial-theme-btn"
                onClick={onOpenTheme}
                className="p-3 rounded-full liquid-btn text-zinc-300 hover:text-emerald-400 mr-3 group"
                title="Change Theme"
              >
                <Palette className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
              </button>

            <div className="flex items-center gap-2 pr-4 border-r border-white/10 mr-2" id="tutorial-add-blocks">
              <button 
                onClick={() => addBlock('social')}
                className="p-3 rounded-full liquid-btn text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 hover:scale-110"
                title="Add Social Link"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => addBlock('text')}
                className="p-3 rounded-full liquid-btn text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 hover:scale-110"
                title="Add Text"
              >
                <Type className="w-5 h-5" />
              </button>
              <button 
                onClick={() => addBlock('list')}
                className="p-3 rounded-full liquid-btn text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10 hover:scale-110"
                title="Add List"
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => addBlock('image')}
                className="p-3 rounded-full liquid-btn text-zinc-400 hover:text-purple-400 hover:bg-purple-400/10 hover:scale-110"
                title="Add Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => addBlock('map')}
                className="p-3 rounded-full liquid-btn text-zinc-400 hover:text-orange-400 hover:bg-orange-400/10 hover:scale-110"
                title="Add Map"
              >
                <Map className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={toggleEdit}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 shadow-lg shadow-white/10 transition-all whitespace-nowrap hover:scale-105 active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>Done</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
