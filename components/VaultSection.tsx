
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Folder, Lock, Unlock, Plus, X, Shield, FolderOpen, Settings, Trash2, Save, ArrowRight, Video, Globe, StickyNote, Link as LinkIcon, Tag, Loader2, SquarePen, Check, Search, CheckCircle2, Type, Image as ImageIcon, Upload, FileText, Download, Share2, ExternalLink, XCircle, Eye, EyeOff, Palette, ArrowLeft, Maximize2, AlignLeft, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Undo, Redo, Highlighter } from 'lucide-react';
import { BlockData, VaultFolder, BlockType, ThemeConfig } from '../types';
import { BentoItem } from './BentoItem';
import { DeleteConfirmModal } from './DeleteConfirmModal';

// --- Types ---
interface VaultSectionProps {
  folders: VaultFolder[];
  isEditing: boolean;
  onUpdateFolders: (folders: VaultFolder[]) => void;
  theme: ThemeConfig;
  isSharedMode?: boolean;
  openFolderId: string | null;
  onOpenFolder: (id: string | null) => void;
}

// --- Helper Functions ---

const normalizeUrl = (url: string): string => {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(normalizeUrl(url)).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return undefined;
  }
};

const formatBytes = (bytes: number, decimals = 1) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// --- Image Processing Helper ---
const processFile = (file: File, maxSizeBytes = 3 * 1024 * 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not image, check size strictly
    if (!file.type.startsWith('image/')) {
       if (file.size > maxSizeBytes) {
           reject(new Error(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max allowed is ${(maxSizeBytes/1024/1024).toFixed(1)}MB.`));
           return;
       }
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result as string);
       reader.onerror = () => reject(new Error("Failed to read file"));
       reader.readAsDataURL(file);
       return;
    }

    // Image Compression
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Resize logic: Max dimension 1280px
            const MAX_DIM = 1280;
            if (width > height) {
                if (width > MAX_DIM) {
                    height = Math.round(height * (MAX_DIM / width));
                    width = MAX_DIM;
                }
            } else {
                if (height > MAX_DIM) {
                    width = Math.round(width * (MAX_DIM / height));
                    height = MAX_DIM;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress to WebP at 0.8 quality (supports transparency, good compression)
            resolve(canvas.toDataURL('image/webp', 0.8));
        };
        img.onerror = () => reject(new Error("Invalid image file"));
        img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
};

// --- Sub-Components ---

// Keeping definition for BlockRenderer compatibility, but unused in Note Editor UI now
const NOTE_COLORS = [
    { name: 'default', bg: 'bg-zinc-900', border: 'border-zinc-800', gradient: 'from-zinc-900 via-zinc-900 to-zinc-950', blob: 'bg-zinc-600' },
    { name: 'red', bg: 'bg-red-900/50', border: 'border-red-500/50', gradient: 'from-red-950 via-red-900/30 to-black', blob: 'bg-red-600' },
    { name: 'orange', bg: 'bg-orange-900/50', border: 'border-orange-500/50', gradient: 'from-orange-950 via-orange-900/30 to-black', blob: 'bg-orange-600' },
    { name: 'yellow', bg: 'bg-yellow-900/50', border: 'border-yellow-500/50', gradient: 'from-yellow-950 via-yellow-900/30 to-black', blob: 'bg-yellow-600' },
    { name: 'green', bg: 'bg-emerald-900/50', border: 'border-emerald-500/50', gradient: 'from-emerald-950 via-emerald-900/30 to-black', blob: 'bg-emerald-600' },
    { name: 'teal', bg: 'bg-teal-900/50', border: 'border-teal-500/50', gradient: 'from-teal-950 via-teal-900/30 to-black', blob: 'bg-teal-600' },
    { name: 'blue', bg: 'bg-blue-900/50', border: 'border-blue-500/50', gradient: 'from-blue-950 via-blue-900/30 to-black', blob: 'bg-blue-600' },
    { name: 'purple', bg: 'bg-purple-900/50', border: 'border-purple-500/50', gradient: 'from-purple-950 via-purple-900/30 to-black', blob: 'bg-purple-600' },
    { name: 'pink', bg: 'bg-pink-900/50', border: 'border-pink-500/50', gradient: 'from-pink-950 via-pink-900/30 to-black', blob: 'bg-pink-600' },
];

const TEXT_COLORS = [
    { name: 'white', value: '#ffffff', class: 'bg-white' },
    { name: 'zinc', value: '#a1a1aa', class: 'bg-zinc-400' },
    { name: 'red', value: '#f87171', class: 'bg-red-400' },
    { name: 'orange', value: '#fb923c', class: 'bg-orange-400' },
    { name: 'amber', value: '#fbbf24', class: 'bg-amber-400' },
    { name: 'emerald', value: '#34d399', class: 'bg-emerald-400' },
    { name: 'cyan', value: '#22d3ee', class: 'bg-cyan-400' },
    { name: 'blue', value: '#60a5fa', class: 'bg-blue-400' },
    { name: 'violet', value: '#a78bfa', class: 'bg-violet-400' },
    { name: 'pink', value: '#f472b6', class: 'bg-pink-400' },
];

interface VaultNotePageProps {
    isOpen: boolean;
    initialData?: BlockData | null;
    onSave: (data: Partial<BlockData>) => void;
    onClose: () => void;
}

const VaultNotePage: React.FC<VaultNotePageProps> = ({ isOpen, initialData, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setTagInput(initialData?.tags?.join(', ') || '');
            // Directly set innerHTML to avoid React re-render lag loops
            if (editorRef.current) {
                editorRef.current.innerHTML = initialData?.content || '';
                updateWordCount();
            }
        }
    }, [isOpen, initialData]);

    const updateWordCount = () => {
        if (editorRef.current) {
            const text = editorRef.current.innerText || '';
            const count = text.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(count);
        }
    };

    const handleSave = () => {
        const content = editorRef.current?.innerHTML || '';
        if (!title.trim() && !content.trim()) {
            onClose();
            return;
        }
        
        const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
        
        onSave({
            title: title || 'Untitled Note',
            content,
            status: 'default', // Default status as we removed theme selection
            tags: Array.from(new Set(tags))
        });
        onClose();
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateWordCount();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/30 backdrop-blur-xl animate-in fade-in duration-300 transform-gpu">
            {/* Ambient noise texture for film grain feel */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full h-full md:p-8">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between p-4 md:p-0 mb-6">
                    <button 
                        onClick={onClose}
                        className="p-3 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-all group backdrop-blur-md border border-white/5 bg-black/20"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transform-gpu"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Note</span>
                    </button>
                </div>

                {/* Editor Surface - Ultra Transparent Liquid Glass */}
                <div className="flex-1 flex flex-col glass-panel md:rounded-[2rem] rounded-t-[2rem] border border-white/10 shadow-2xl backdrop-blur-3xl overflow-hidden bg-black/5 will-change-transform">
                     
                     {/* Title Input */}
                     <input 
                        type="text"
                        placeholder="Untitled Note..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-transparent border-none text-4xl md:text-5xl font-bold text-white placeholder:text-white/20 focus:outline-none p-6 md:px-10 md:pt-10 md:pb-6 drop-shadow-sm"
                        autoFocus
                     />

                     {/* Premium Toolbar */}
                     <div className="px-6 md:px-10 flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 mb-2">
                        {/* History */}
                        <div className="flex items-center bg-black/20 rounded-lg p-1 mr-2 border border-white/5">
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('undo'); }} className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Undo">
                                <Undo className="w-4 h-4" />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('redo'); }} className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Redo">
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Formatting */}
                        <div className="flex items-center bg-black/20 rounded-lg p-1 mr-2 border border-white/5">
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-2 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors" title="Bold">
                                <Bold className="w-4 h-4" />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-2 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors" title="Italic">
                                <Italic className="w-4 h-4" />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className="p-2 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors" title="Underline">
                                <Underline className="w-4 h-4" />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('strikeThrough'); }} className="p-2 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors" title="Strikethrough">
                                <Strikethrough className="w-4 h-4" />
                            </button>
                        </div>

                         {/* Lists */}
                        <div className="flex items-center bg-black/20 rounded-lg p-1 mr-2 border border-white/5">
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="p-2 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors" title="Bullet List">
                                <List className="w-4 h-4" />
                            </button>
                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }} className="p-2 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition-colors" title="Numbered List">
                                <ListOrdered className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Text Colors */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/20 rounded-lg border border-white/5 ml-auto md:ml-0 overflow-x-auto no-scrollbar max-w-[150px] md:max-w-none">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase mr-1">Color</span>
                            {TEXT_COLORS.map(c => (
                                <button
                                    key={c.name}
                                    onMouseDown={(e) => { e.preventDefault(); execCmd('foreColor', c.value); }}
                                    className={`w-4 h-4 rounded-full ${c.class} hover:scale-125 transition-transform border border-white/10 shadow-sm`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                     </div>

                     {/* Content Area - Uncontrolled & Optimized */}
                     <div
                        ref={editorRef}
                        contentEditable
                        className="flex-1 w-full bg-transparent border-none text-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none px-6 md:px-10 py-4 overflow-y-auto outline-none custom-scrollbar selection:bg-emerald-500/30 selection:text-white prose prose-invert max-w-none prose-p:my-2 prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4 prose-headings:font-bold prose-headings:text-white"
                        onInput={updateWordCount}
                        spellCheck={false}
                     />

                     {/* Footer Metadata */}
                     <div className="p-6 md:px-10 md:py-6 bg-black/20 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
                         <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                             <span className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                                <AlignLeft className="w-3 h-3" />
                                {wordCount} Words
                             </span>
                         </div>

                         <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[300px] bg-black/30 rounded-xl px-4 py-3 border border-white/5 focus-within:border-white/20 transition-colors focus-within:bg-black/50">
                            <Tag className="w-4 h-4 text-zinc-500" />
                            <input 
                                type="text"
                                placeholder="Tags (e.g. ideas, work, personal)"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                className="bg-transparent border-none text-sm text-white placeholder:text-zinc-600 focus:outline-none w-full"
                            />
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};


const DocumentPreviewModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    block: BlockData | null; 
}> = ({ isOpen, onClose, block }) => {
    if (!isOpen || !block) return null;

    // Enhanced image detection
    const isImage = block.type === 'image' || 
                   (block.url && (block.url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) || block.url.startsWith('data:image')));
    
    // Get extension logic
    const getExtension = () => {
         if (block.content && block.content.includes('.')) {
             const parts = block.content.split('.');
             const ext = parts.pop();
             if (ext && ext.length < 6) return ext.toUpperCase();
         }
         if (block.url && !block.url.startsWith('data:')) {
             try {
                const url = new URL(block.url);
                const path = url.pathname;
                if (path.includes('.')) {
                    const ext = path.split('.').pop();
                    if (ext && ext.length < 6) return ext.toUpperCase();
                }
             } catch (e) {}
         }
         return 'FILE';
    };

    const ext = getExtension();

    // Premium Liquid Glass Theme Map - REDUCED OPACITY FOR TRANSPARENCY
    const getTheme = () => {
        const e = ext.toLowerCase();
        if (e === 'pdf') return {
            bg: 'bg-gradient-to-br from-[#450a0a]/40 via-[#ef4444]/5 to-[#450a0a]/40',
            border: 'border-red-500/30',
            icon: 'text-red-400',
            glow: 'bg-red-500/30',
            shadow: 'shadow-red-900/20'
        };
        if (['doc', 'docx'].includes(e)) return {
            bg: 'bg-gradient-to-br from-[#172554]/40 via-[#3b82f6]/5 to-[#172554]/40',
            border: 'border-blue-500/30',
            icon: 'text-blue-400',
            glow: 'bg-blue-500/30',
            shadow: 'shadow-blue-900/20'
        };
        if (['xls', 'xlsx', 'csv'].includes(e)) return {
            bg: 'bg-gradient-to-br from-[#064e3b]/40 via-[#10b981]/5 to-[#064e3b]/40',
            border: 'border-emerald-500/30',
            icon: 'text-emerald-400',
            glow: 'bg-emerald-500/30',
            shadow: 'shadow-emerald-900/20'
        };
        if (['ppt', 'pptx'].includes(e)) return {
            bg: 'bg-gradient-to-br from-[#7c2d12]/40 via-[#f97316]/5 to-[#7c2d12]/40',
            border: 'border-orange-500/30',
            icon: 'text-orange-400',
            glow: 'bg-orange-500/30',
            shadow: 'shadow-orange-900/20'
        };
        if (['zip', 'rar', '7z'].includes(e)) return {
            bg: 'bg-gradient-to-br from-[#713f12]/40 via-[#eab308]/5 to-[#713f12]/40',
            border: 'border-yellow-500/30',
            icon: 'text-yellow-400',
            glow: 'bg-yellow-500/30',
            shadow: 'shadow-yellow-900/20'
        };
        return {
            bg: 'bg-gradient-to-br from-zinc-900/40 via-zinc-500/5 to-zinc-900/40',
            border: 'border-white/10',
            icon: 'text-zinc-400',
            glow: 'bg-white/5',
            shadow: 'shadow-black/40'
        };
    };
    
    const theme = getTheme();

    const handleDownload = () => {
        if (!block.url) return;
        const link = document.createElement('a');
        link.href = block.url;
        link.download = block.title || `download.${ext.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (navigator.share && block.url) {
            try {
                await navigator.share({
                    title: block.title,
                    text: block.content,
                    url: block.url
                });
            } catch (e) {
                console.log('Share failed', e);
            }
        } else {
            // Fallback
            if (block.url) {
                navigator.clipboard.writeText(block.url);
                alert('Link copied to clipboard!');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            {/* Ambient Background Blobs for the Modal Context */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${theme.glow} rounded-full blur-[100px] animate-pulse opacity-40`} />
                 <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${theme.glow} rounded-full blur-[100px] animate-pulse delay-700 opacity-30`} />
            </div>

            <div className="relative w-full max-w-4xl h-[85vh] flex flex-col glass-panel rounded-[2.5rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden bg-[#09090b]/30 backdrop-blur-3xl">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-md z-20">
                    <div>
                        <h3 className="text-xl font-bold text-white line-clamp-1 drop-shadow-md">{block.title}</h3>
                        <p className="text-zinc-400 text-xs flex items-center gap-2 mt-1">
                             {block.fileSize ? <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/80 font-mono border border-white/5">{block.fileSize}</span> : null}
                             <span className="opacity-70">{block.content || `${ext} File`}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors group">
                        <X className="w-6 h-6 text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                    </button>
                </div>

                {/* Content Preview Area */}
                <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
                     {/* Background Grid/Noise */}
                     <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
                        style={{ 
                            backgroundImage: 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
                            backgroundSize: '24px 24px',
                            backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
                        }} 
                     />

                     {isImage ? (
                         <div className="relative group z-10 w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/50 blur-2xl -z-10 opacity-50" />
                            <img 
                                src={block.url || block.imageUrl} 
                                alt={block.title} 
                                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
                            />
                         </div>
                     ) : (
                         // Non-image Logic - The Premium Liquid Glass Card
                         <div className="relative group z-10">
                            {/* Card Glow */}
                            <div className={`absolute -inset-8 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 ${theme.glow}`} />
                            
                            {/* The Holographic Card - INCREASED BLUR & TRANSPARENCY */}
                            <div className={`
                                relative w-64 h-80 rounded-[2rem] 
                                border ${theme.border} ${theme.bg}
                                backdrop-blur-3xl ${theme.shadow}
                                flex flex-col items-center justify-center
                                overflow-hidden transition-all duration-500 
                                group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]
                            `}>
                                {/* Inner Liquid/Gloss Effects */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                                
                                {/* Diagonal Sheen Animation */}
                                <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 group-hover:translate-x-[50%] group-hover:translate-y-[50%] transition-transform duration-1000 ease-out pointer-events-none" />
                                
                                {/* Icon Container with Inner Glow */}
                                <div className={`mb-6 p-6 rounded-3xl bg-black/20 border border-white/5 shadow-inner backdrop-blur-sm relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                                     <div className={`absolute inset-0 ${theme.glow} opacity-20 blur-md`} />
                                     <FileText className={`w-16 h-16 ${theme.icon} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10`} />
                                </div>
                                
                                <h4 className="text-3xl font-black text-white tracking-widest drop-shadow-lg scale-y-110">{ext}</h4>
                                <div className="mt-3 h-px w-12 bg-white/20" />
                                <span className="mt-3 text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">Document</span>
                            </div>
                         </div>
                     )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-black/20 flex justify-center gap-4 z-20 backdrop-blur-md">
                     <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl liquid-btn text-white font-bold hover:text-white border border-white/10 hover:border-white/30 shadow-lg hover:shadow-white/10 transition-all hover:scale-105 active:scale-95 group"
                     >
                        <Download className="w-4 h-4 group-hover:animate-bounce" />
                        Download {ext !== 'FILE' ? ext : 'File'}
                     </button>
                     <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl liquid-btn text-zinc-300 font-bold hover:text-white border border-white/5 hover:border-white/20 transition-all hover:scale-105 active:scale-95"
                     >
                        <Share2 className="w-4 h-4" />
                        Share
                     </button>
                </div>
            </div>
        </div>
    );
};

// --- Vault Add Item Modal ---

interface VaultAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: BlockData) => void;
  onOpenNoteStudio: () => void;
}

const VaultAddItemModal: React.FC<VaultAddItemModalProps> = ({ isOpen, onClose, onAdd, onOpenNoteStudio }) => {
  const [type, setType] = useState<'video' | 'link' | 'note' | 'document'>(() => {
    try {
        const saved = localStorage.getItem('bloxm_vault_add_tab');
        return (saved as 'video' | 'link' | 'note' | 'document') || 'video';
    } catch { return 'video'; }
  });

  const [url, setUrl] = useState('');
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, type: string, sizeStr: string} | null>(null);
  const [isManualTitle, setIsManualTitle] = useState(false);

  const normalizeUrl = (input: string) => {
      if (!input) return '';
      if (input.match(/^https?:\/\//i)) return input;
      return 'https://' + input;
  };

  const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!url || (type as string) === 'note' || type === 'document') {
        setIsFetching(false);
        if (!url && !isManualTitle && type !== 'note') setTitle('');
        return;
    }

    if (isManualTitle) return;

    const controller = new AbortController();
    
    const debounceTimer = setTimeout(async () => {
       setIsFetching(true);
       let fetchedTitle = null;
       
       try {
          const fetchUrl = normalizeUrl(url);
          const targetUrl = fetchUrl.toLowerCase();
          const isOembedProvider = targetUrl.includes('youtube.com') || 
                                   targetUrl.includes('youtu.be') || 
                                   targetUrl.includes('vimeo.com') || 
                                   targetUrl.includes('reddit.com');

          if (isOembedProvider) {
              try {
                  const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(fetchUrl)}`, { signal: controller.signal });
                  const data = await res.json();
                  if (data.title && !data.error) {
                      fetchedTitle = data.title;
                  }
              } catch (e) { /* ignore */ }
          }

          if (!fetchedTitle) {
              try {
                  const microRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(fetchUrl)}`, { signal: controller.signal });
                  const microData = await microRes.json();
                  
                  if (microData.status === 'success') {
                      const { title, description } = microData.data;
                      const isSocialMedia = targetUrl.includes('instagram.com') || targetUrl.includes('tiktok.com') || targetUrl.includes('twitter.com') || targetUrl.includes('x.com');
                      
                      if (isSocialMedia) {
                          if (targetUrl.includes('instagram.com') && description) {
                                const captionMatch = description.match(/on Instagram:\s*["“](.*?)["”]/);
                                if (captionMatch && captionMatch[1]) {
                                    fetchedTitle = captionMatch[1];
                                } else {
                                     const isGenericStats = /^[0-9,.]+\s+(Likes|Comments)/i.test(description);
                                     if (!description.includes('Log in') && !description.includes('Create an account') && !isGenericStats) {
                                         fetchedTitle = description;
                                     }
                                }
                          } else {
                              if (description && !description.includes('Log in') && !description.includes('Create an account')) {
                                   fetchedTitle = description;
                              } else if (title && !title.includes('Log in') && !title.includes('Instagram') && !title.includes('TikTok') && !title.includes('X')) {
                                   fetchedTitle = title;
                              }
                          }
                          if (fetchedTitle && fetchedTitle.length > 65) {
                              fetchedTitle = fetchedTitle.substring(0, 65) + '...';
                          }
                      } else {
                          fetchedTitle = title || description;
                      }
                  }
              } catch (e) { /* ignore */ }
          }
          
       } catch (err) {
       } finally {
          if (!controller.signal.aborted) {
              if (fetchedTitle) {
                  setTitle(fetchedTitle);
              } else {
                  runHeuristic(normalizeUrl(url));
              }
              setIsFetching(false);
          }
       }
    }, 800); 

    return () => {
        clearTimeout(debounceTimer);
        controller.abort();
    };
  }, [url, type, isManualTitle]);

  const runHeuristic = (val: string) => {
     let fallback = 'Link Item';
     try {
         const lower = val.toLowerCase();
         if (lower.includes('youtube') || lower.includes('youtu.be')) fallback = 'YouTube Video';
         else if (lower.includes('vimeo')) fallback = 'Vimeo Video';
         else if (lower.includes('tiktok')) fallback = 'TikTok Post';
         else if (lower.includes('twitter') || lower.includes('x.com')) fallback = 'X Post';
         else if (lower.includes('instagram')) fallback = 'Instagram Post';
         else {
            try {
                const urlObj = new URL(val);
                const domain = urlObj.hostname.replace('www.', '').split('.')[0];
                if (domain) {
                    fallback = domain.charAt(0).toUpperCase() + domain.slice(1);
                    const path = urlObj.pathname.split('/').filter(Boolean).pop();
                    if (path && path.length > 3) {
                       fallback += ` - ${path.replace(/-/g, ' ')}`;
                    }
                }
            } catch (e) { }
         }
     } catch(e) {}
     setTitle(fallback);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            const sizeStr = formatFileSize(file.size);
            // Use new compression utility
            const dataUrl = await processFile(file);
            setUploadedFile({ name: file.name, data: dataUrl, type: file.type, sizeStr });
            if (!title) setTitle(file.name);
        } catch (err: any) {
            alert(err.message || "File could not be processed.");
        }
    }
  };

  const handleTypeChange = (newType: 'video' | 'link' | 'note' | 'document') => {
      setType(newType);
      localStorage.setItem('bloxm_vault_add_tab', newType);
      setUrl('');
      setTag('');
      setTitle('');
      setUploadedFile(null);
      setIsFetching(false);
      setIsManualTitle(false);
  };

  const handleSubmit = (data?: Partial<BlockData>) => {
    const id = Date.now().toString();
    
    // Default handler for other types
    let icon = 'globe';
    let finalUrl = url;
    let blockType: BlockType = 'social';
    let imageUrl = undefined;
    let faviconUrl = undefined;

    if (type === 'document' && uploadedFile) {
        finalUrl = uploadedFile.data;
        if (uploadedFile.type.startsWith('image/')) {
            blockType = 'image';
            imageUrl = uploadedFile.data;
        }
    } else {
        finalUrl = normalizeUrl(url);
        try {
            const domain = new URL(finalUrl).hostname;
            faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } catch (e) {}
    }

    if (type === 'video') {
        icon = 'video';
        if (finalUrl.includes('twitter') || finalUrl.includes('x.com')) icon = 'twitter';
        if (finalUrl.includes('instagram')) icon = 'instagram';
        if (finalUrl.includes('tiktok')) icon = 'video';
        if (finalUrl.includes('youtube')) icon = 'youtube';
    } else if (type === 'link') {
        icon = 'link';
    } else if (type === 'document') {
        icon = 'file-text';
    }

    const block: BlockData = {
        id,
        type: blockType,
        size: '1x1',
        title: title || (type === 'document' ? uploadedFile?.name : 'New Item'),
        url: finalUrl,
        iconName: icon,
        imageUrl: imageUrl, 
        faviconUrl: faviconUrl,
        tags: [type === 'video' ? 'post' : type, tag, type === 'document' ? 'document' : ''].filter(Boolean),
        lastUpdated: Date.now(),
        content: type === 'document' ? uploadedFile?.name : undefined,
        fileSize: type === 'document' ? uploadedFile?.sizeStr : undefined
    };

    onAdd(block);
    setUrl('');
    setTag('');
    setTitle('');
    setUploadedFile(null);
    setIsFetching(false);
    setIsManualTitle(false);
    onClose();
  };

  const handleEnterNoteStudio = () => {
      onOpenNoteStudio();
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full ${type === 'note' ? 'max-w-2xl' : 'max-w-lg'} glass-panel rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 transition-all duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Add to Vault</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl mb-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => handleTypeChange('video')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap px-4 ${type === 'video' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
            <Video className="w-4 h-4" /> Posts
          </button>
          <button onClick={() => handleTypeChange('link')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap px-4 ${type === 'link' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
            <Globe className="w-4 h-4" /> Link
          </button>
           <button onClick={() => handleTypeChange('document')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap px-4 ${type === 'document' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
            <FileText className="w-4 h-4" /> Doc
          </button>
          <button onClick={() => handleTypeChange('note')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap px-4 ${type === 'note' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
            <StickyNote className="w-4 h-4" /> Note
          </button>
        </div>

        {type === 'note' ? (
             <div className="animate-in fade-in slide-in-from-bottom-2 text-center py-8">
                 <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5">
                    <SquarePen className="w-8 h-8 text-emerald-300" />
                 </div>
                 <h4 className="text-xl font-bold text-white mb-2">Create a New Note</h4>
                 <p className="text-zinc-400 text-sm mb-8 max-w-xs mx-auto">Open the full-screen Note Studio for a distraction-free writing experience.</p>
                 
                 <button 
                    onClick={handleEnterNoteStudio}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                 >
                    <Maximize2 className="w-4 h-4" />
                    Enter Note Studio
                 </button>
             </div>
        ) : (
            <div className="space-y-4">
            <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 mb-1 block">
                    {type === 'document' ? 'Upload Document' : 'URL Link'}
                </label>
                
                {type === 'document' ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 bg-black/20 hover:bg-black/40 hover:border-emerald-500/30 transition-all text-center group cursor-pointer relative">
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleDocumentUpload}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                            <p className="text-sm text-zinc-400 font-medium">{uploadedFile ? uploadedFile.name : 'Click to upload file'}</p>
                            <p className="text-xs text-zinc-600">Max 3MB (Local)</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            type="url" 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-emerald-500/50 focus:outline-none placeholder:text-zinc-600"
                            placeholder="https://..."
                            autoFocus
                        />
                        {isFetching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="animate-in slide-in-from-bottom-2 duration-300">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 mb-1 block">
                    Display Title
                </label>
                <input 
                    type="text" 
                    value={title}
                    onChange={e => { setTitle(e.target.value); setIsManualTitle(true); }}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none placeholder:text-zinc-600"
                    placeholder="e.g. My Awesome Item"
                />
            </div>

            <div className="animate-in slide-in-from-bottom-2 duration-300 delay-100">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 mb-1 block">Tag (Optional)</label>
                <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input 
                        type="text" 
                        value={tag}
                        onChange={e => setTag(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-emerald-500/50 focus:outline-none placeholder:text-zinc-600"
                        placeholder="e.g. Work, Fun, Secret"
                    />
                </div>
            </div>
            
            <button 
                onClick={() => handleSubmit()}
                disabled={(!url && !uploadedFile) || !title}
                className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
            >
                Add Item
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- Vault Edit Item Modal ---

interface VaultEditItemModalProps {
  isOpen: boolean;
  block: BlockData | null;
  onClose: () => void;
  onSave: (updatedBlock: BlockData) => void;
  onOpenNoteStudio: (block: BlockData) => void;
}

const VaultEditItemModal: React.FC<VaultEditItemModalProps> = ({ isOpen, block, onClose, onSave, onOpenNoteStudio }) => {
    const [formData, setFormData] = useState<Partial<BlockData>>({});
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (block) {
            setFormData({ ...block });
            setTagInput(block.tags ? Array.from(new Set(block.tags)).join(', ') : '');
        }
    }, [block]);

    if (!isOpen || !block) return null;

    const isNote = block.type === 'text';

    const handleSave = (data?: Partial<BlockData>) => {
        const rawTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
        const tags = Array.from(new Set(rawTags)); // Deduplicate tags
        onSave({ ...block, ...formData, tags } as BlockData);
        onClose();
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Use new compression utility
                const dataUrl = await processFile(file);
                setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
            } catch (err: any) {
                alert(err.message || "Failed to process image");
            }
        }
    };

    const handleEditInStudio = () => {
        if (block) {
            onOpenNoteStudio(block);
            onClose();
        }
    };

    const isDataUri = (str?: string) => str?.startsWith('data:');

    const labelStyle = "block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest ml-1";
    const inputStyle = "w-full bg-zinc-950 border border-white/5 rounded-xl py-3.5 pl-4 pr-4 text-sm text-white focus:border-emerald-500/50 focus:bg-black focus:outline-none transition-all";

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className={`relative w-full ${isNote ? 'max-w-md' : 'max-w-md'} max-h-[85vh] overflow-y-auto custom-scrollbar glass-panel rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 transition-all duration-300`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Edit Item</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>

                {isNote ? (
                     <div className="text-center py-6">
                         <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/5">
                            <SquarePen className="w-8 h-8 text-emerald-300" />
                         </div>
                         <h4 className="text-lg font-bold text-white mb-2">Edit Note in Studio</h4>
                         <p className="text-zinc-400 text-xs mb-6 max-w-xs mx-auto">Open the full-screen editor to modify your note content, colors, and tags.</p>
                         
                         <button 
                            onClick={handleEditInStudio}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                         >
                            <Maximize2 className="w-4 h-4" />
                            Open Note Studio
                         </button>
                     </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <label className={labelStyle}>Title</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className={inputStyle}
                                    autoComplete="off"
                                    name="vault_edit_title"
                                />
                            </div>
                        </div>

                        {!isNote && (
                            <div>
                                <label className={labelStyle}>Link URL</label>
                                {isDataUri(formData.url) ? (
                                    <div className="flex items-center justify-between w-full bg-zinc-900/50 border border-emerald-500/30 rounded-xl p-3">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-sm text-emerald-200 truncate">Embedded File Data</span>
                                        </div>
                                        <button 
                                            onClick={() => setFormData(prev => ({ ...prev, url: '' }))}
                                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.url || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                            className={inputStyle}
                                            autoComplete="off"
                                            name="vault_edit_url"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className={labelStyle}>Tags (Comma Separated)</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    className={inputStyle}
                                    autoComplete="off"
                                    name="vault_edit_tags"
                                />
                            </div>
                        </div>

                        {!isNote && (
                            <div>
                                <label className={labelStyle}>Appearance (Banner)</label>
                                <div className="flex gap-3 mb-2">
                                    {isDataUri(formData.imageUrl) ? (
                                        <div className="flex-1 flex items-center justify-between bg-zinc-900/50 border border-purple-500/30 rounded-xl p-3.5">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
                                                <span className="text-sm text-purple-200 truncate">Uploaded Image</span>
                                            </div>
                                            <button 
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.imageUrl || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className={`${inputStyle} flex-1`}
                                            autoComplete="off"
                                            name="vault_edit_image_url"
                                        />
                                    )}
                                    <label className="cursor-pointer bg-zinc-950/80 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl w-[50px] flex items-center justify-center transition-colors group">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        <Upload className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                    </label>
                                </div>
                                {/* Image Preview */}
                                {formData.imageUrl && (
                                    <div className="h-32 w-full rounded-xl overflow-hidden border border-white/10 relative mt-2 group">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full border border-white/10">Preview</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button 
                            onClick={() => handleSave()}
                            className="w-full py-3.5 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const VaultSection: React.FC<VaultSectionProps> = ({ 
  folders, 
  isEditing, 
  onUpdateFolders, 
  theme, 
  isSharedMode = false,
  openFolderId, 
  onOpenFolder
}) => {
  const [authFolderId, setAuthFolderId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // Verification state for switching Private -> Public
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [showFolderPassword, setShowFolderPassword] = useState(false);

  // Unified Create/Edit Modal State
  const [folderModal, setFolderModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    folderId?: string;
    data: Partial<VaultFolder>;
  }>({
    isOpen: false,
    mode: 'create',
    data: { type: 'public' }
  });

  // Adding Items
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isVaultEditing, setIsVaultEditing] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Inside Vault State
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<BlockData | null>(null);
  
  // Multi-select State
  const [selectedVaultItemIds, setSelectedVaultItemIds] = useState<string[]>([]);
  const [isBulkDeleteVault, setIsBulkDeleteVault] = useState(false);

  // Note Studio State
  const [notePage, setNotePage] = useState<{ isOpen: boolean; data: BlockData | null; mode: 'create' | 'edit' }>({ 
      isOpen: false, 
      data: null, 
      mode: 'create' 
  });

  // Folder Deletion State
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const activeFolder = (folders || []).find(f => f && f.id === openFolderId);

  useEffect(() => {
    if (!openFolderId) {
        setIsVaultEditing(false);
        setSearchQuery('');
    }
  }, [openFolderId]);

  // Clear selection when exiting edit mode or closing folder
  useEffect(() => {
    if (!openFolderId || !isVaultEditing) {
        setSelectedVaultItemIds([]);
        setIsBulkDeleteVault(false);
    }
  }, [openFolderId, isVaultEditing]);

  const getBackgroundStyle = () => {
    if (theme.type === 'image') {
       return {
         backgroundImage: `url(${theme.value})`,
         backgroundSize: 'cover',
         backgroundPosition: 'center',
       };
    }
    return { background: theme.value };
  };

  // --- Folder Management ---

  const handleOpenCreate = () => {
    setShowFolderPassword(false);
    setFolderModal({
      isOpen: true,
      mode: 'create',
      data: { type: 'public', name: '', password: '' }
    });
  };

  const handleOpenEdit = (folder: VaultFolder) => {
    setVerifyPassword('');
    setVerificationStatus('idle');
    setShowFolderPassword(false);
    setFolderModal({
      isOpen: true,
      mode: 'edit',
      folderId: folder.id,
      data: { ...folder }
    });
  };

  // Helper to determine if we need verification UI
  const showVerification = useMemo(() => {
     if (folderModal.mode !== 'edit' || !folderModal.folderId) return false;
     const original = (folders || []).find(f => f.id === folderModal.folderId);
     return original?.type === 'private' && folderModal.data.type === 'public';
  }, [folderModal, folders]);

  // Debounced Password Validation Effect
  useEffect(() => {
    if (!verifyPassword) {
        setVerificationStatus('idle');
        return;
    }
    
    if (showVerification) {
        setVerificationStatus('validating');
        const timer = setTimeout(() => {
             const originalFolder = (folders || []).find(f => f.id === folderModal.folderId);
             if (originalFolder && verifyPassword === originalFolder.password) {
                 setVerificationStatus('success');
             } else {
                 setVerificationStatus('error');
             }
        }, 800); // 800ms delay to simulate loading check
        return () => clearTimeout(timer);
    }
  }, [verifyPassword, showVerification, folders, folderModal.folderId]);

  const handleSaveFolder = () => {
    const { mode, data, folderId } = folderModal;
    if (!data.name) return;

    // Validation logic for switching private -> public
    if (mode === 'edit' && folderId) {
        const originalFolder = (folders || []).find(f => f.id === folderId);
        // If changing from Private to Public, verify password match or status
        if (originalFolder?.type === 'private' && data.type === 'public') {
            if (verifyPassword !== originalFolder.password) {
                // If the user tries to save quickly before validation or with wrong pass
                setVerificationStatus('error');
                return; // Stop save
            }
        }
    }

    if (mode === 'create') {
      const newFolder: VaultFolder = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type || 'public',
        password: data.password,
        items: [],
        description: data.description || 'A collection of hidden gems.'
      };
      onUpdateFolders([...(folders || []), newFolder]);
    } else if (mode === 'edit' && folderId) {
      onUpdateFolders((folders || []).map(f => (f && f.id === folderId) ? { ...f, ...data } as VaultFolder : f));
    }

    setFolderModal(prev => ({ ...prev, isOpen: false }));
    setVerifyPassword('');
    setVerificationStatus('idle');
  };

  const handleDeleteFolder = (id: string) => {
    setFolderToDelete(id);
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      onUpdateFolders((folders || []).filter(f => f && f.id !== folderToDelete));
      if (openFolderId === folderToDelete) onOpenFolder(null);
      setFolderToDelete(null);
    }
  };

  const handleFolderClick = (folder: VaultFolder) => {
    if (!folder) return;
    if (isEditing) return; // Don't open when editing layout
    if (folder.type === 'private') {
      setAuthFolderId(folder.id);
      setPasswordInput('');
      setAuthError(false);
    } else {
      onOpenFolder(folder.id);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const folder = (folders || []).find(f => f && f.id === authFolderId);
    if (folder && folder.password === passwordInput) {
      onOpenFolder(folder.id);
      setAuthFolderId(null);
    } else {
      setAuthError(true);
    }
  };

  // --- Inner Block Management ---

  const updateFolderItems = (folderId: string, newItems: BlockData[]) => {
    onUpdateFolders((folders || []).map(f => (f && f.id === folderId) ? { ...f, items: newItems } : f));
  };

  const handleAddBlockData = (blockData: BlockData) => {
    if (!activeFolder) return;
    const currentItems = activeFolder.items || [];
    updateFolderItems(activeFolder.id, [...currentItems, blockData]);
  };

  const handleRemoveBlock = (id: string) => {
    setBlockToDelete(id);
  };

  const handleBulkDeleteTrigger = () => {
    setIsBulkDeleteVault(true);
    setBlockToDelete('BULK');
  };

  const confirmRemoveBlock = () => {
    if (!activeFolder) return;
    const currentItems = activeFolder.items || [];
    
    if (isBulkDeleteVault) {
        const newItems = currentItems.filter(b => b && !selectedVaultItemIds.includes(b.id));
        updateFolderItems(activeFolder.id, newItems);
        setSelectedVaultItemIds([]);
        setIsBulkDeleteVault(false);
    } else if (blockToDelete) {
        updateFolderItems(activeFolder.id, currentItems.filter(b => b && b.id !== blockToDelete));
    }
    setBlockToDelete(null);
  };

  const handleUpdateBlock = (updatedBlock: BlockData) => {
    if (!activeFolder) return;
    const currentItems = activeFolder.items || [];
    const blockWithTime = { ...updatedBlock, lastUpdated: Date.now() };
    updateFolderItems(activeFolder.id, currentItems.map(b => (b && b.id === updatedBlock.id) ? blockWithTime : b));
  };

  // Handle saving from the Full Note Studio
  const handleSaveNote = (data: Partial<BlockData>) => {
      if (notePage.mode === 'create') {
          // Add new note
          const newBlock: BlockData = {
            id: Date.now().toString(),
            type: 'text',
            size: '2x1',
            title: data.title || 'Untitled Note',
            content: data.content || '',
            status: data.status,
            tags: data.tags,
            lastUpdated: Date.now()
          };
          handleAddBlockData(newBlock);
      } else if (notePage.mode === 'edit' && notePage.data) {
          // Update existing note
          const updatedBlock = {
              ...notePage.data,
              ...data,
              lastUpdated: Date.now()
          };
          handleUpdateBlock(updatedBlock as BlockData);
      }
      setNotePage({ isOpen: false, data: null, mode: 'create' });
  };

  const handleResizeBlock = (id: string) => {
    if (!activeFolder) return;
    const currentItems = activeFolder.items || [];
    const sizes = ['1x1', '2x1', '2x2', '1x2'];
    updateFolderItems(activeFolder.id, currentItems.map(b => {
      if (!b || b.id !== id) return b;
      const currentIndex = sizes.indexOf(b.size);
      const nextSize = currentIndex !== -1 ? sizes[(currentIndex + 1) % sizes.length] : '1x1';
      return { ...b, size: nextSize };
    }));
  };

  const handleMoveBlock = useCallback((dragId: string, hoverId: string) => {
    if (!activeFolder) return;
    const prev = activeFolder.items || [];
    const dragIndex = prev.findIndex(b => b && b.id === dragId);
    const hoverIndex = prev.findIndex(b => b && b.id === hoverId);
    if (dragIndex < 0 || hoverIndex < 0 || dragIndex === hoverIndex) return;
    
    const newBlocks = [...prev];
    const [draggedItem] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedItem);
    updateFolderItems(activeFolder.id, newBlocks);
  }, [activeFolder, onUpdateFolders]);

  const handleVaultItemInteraction = (id: string, isModifierPressed: boolean) => {
    if (!isVaultEditing) return;
    const currentItems = activeFolder?.items || [];

    if (isModifierPressed || selectedVaultItemIds.length > 0) {
       setSelectedVaultItemIds(prev => {
         if (prev.includes(id)) return prev.filter(i => i !== id);
         return [...prev, id];
       });
    } else {
       // Open editor
       const block = currentItems.find(b => b && b.id === id);
       if (block) setEditingBlock(block);
    }
  };

  const handleItemClick = (block: BlockData) => {
      // Document previews handled by modal
      if (block.tags?.includes('document')) {
          setPreviewDocument(block);
      } else if (block.url) {
          // Manually handle redirection for other links because BentoItem intercepts the click
          window.open(block.url, '_blank', 'noopener,noreferrer');
      }
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    const currentItems = activeFolder?.items || [];
    return currentItems.filter(item => {
      if (!item) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.title?.toLowerCase().includes(q)) ||
        (item.content?.toLowerCase().includes(q)) ||
        (item.tags?.some(tag => tag && tag.toLowerCase().includes(q)))
      );
    });
  }, [activeFolder, searchQuery]); 

  return (
    <div className="mt-24 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Liquid Line */}
      <div className="relative w-full h-px my-12">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[2px] opacity-30 animate-pulse" />
      </div>

      {/* Vault Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-4xl font-bold text-white flex items-center gap-3 text-glow">
          <Shield className="w-8 h-8 text-emerald-400" />
          Vault
        </h2>
        {isEditing && !isSharedMode && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-emerald-400 text-sm font-medium transition-all border border-white/5 hover:border-emerald-500/30"
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        )}
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(folders || []).filter(Boolean).map(folder => (
          <div 
            key={folder.id}
            onClick={() => handleFolderClick(folder)}
            className={`
              group relative aspect-[4/3] glass-panel rounded-3xl p-6 flex flex-col justify-between
              transition-all duration-300 
              ${isEditing && !isSharedMode ? 'cursor-default' : 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_-5px_rgba(16,185,129,0.15)]'}
            `}
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${folder.type === 'private' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'} group-hover:scale-110 transition-transform duration-500`}>
                {folder.type === 'private' ? <Lock className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
              </div>
              {isEditing && !isSharedMode && (
                <div className="flex gap-1">
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(folder); }}
                    className="p-2 rounded-full hover:bg-white/10 text-zinc-500 hover:text-emerald-400 transition-colors"
                    title="Folder Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    className="p-2 rounded-full hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-emerald-300 transition-colors">{folder.name}</h3>
              <p className="text-zinc-500 text-xs font-medium mt-1 truncate">{(folder.items || []).length} items</p>
            </div>

            {/* Folder Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${folder.type === 'private' ? 'from-red-500/5' : 'from-blue-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl`} />
          </div>
        ))}

        {(!folders || folders.length === 0) && !folderModal.isOpen && (
           <div className="col-span-full text-center py-12 border border-dashed border-zinc-800 rounded-3xl bg-black/20">
              <FolderOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Vault is empty. {isEditing && !isSharedMode ? 'Create a folder to start.' : ''}</p>
           </div>
        )}
      </div>

      {/* Unified Folder Modal (Create/Edit) */}
      {folderModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setFolderModal(prev => ({ ...prev, isOpen: false }))} />
          <div className="relative w-full max-w-md glass-panel rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-bold text-white mb-6">
               {folderModal.mode === 'create' ? 'New Vault Folder' : 'Edit Folder Settings'}
             </h3>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Folder Name</label>
                 <input 
                    type="text" 
                    value={folderModal.data.name || ''}
                    onChange={e => setFolderModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none mt-1"
                    placeholder="e.g. Secret Plans"
                    autoFocus
                 />
               </div>
               
               <div className="flex gap-4">
                  <button 
                    onClick={() => setFolderModal(prev => ({ ...prev, data: { ...prev.data, type: 'public' } }))}
                    className={`flex-1 py-3 rounded-xl border ${folderModal.data.type === 'public' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-white/5 text-zinc-500 hover:bg-white/5'} font-medium transition-all`}
                  >
                    Public
                  </button>
                  <button 
                    onClick={() => setFolderModal(prev => ({ ...prev, data: { ...prev.data, type: 'private' } }))}
                    className={`flex-1 py-3 rounded-xl border ${folderModal.data.type === 'private' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/5 text-zinc-500 hover:bg-white/5'} font-medium transition-all`}
                  >
                    Private
                  </button>
               </div>

               {folderModal.data.type === 'private' && (
                 <div className="animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">
                      {folderModal.mode === 'edit' ? 'Set/Update Password' : 'Set Password'}
                    </label>
                    <div className="relative mt-1">
                      <input 
                          type={showFolderPassword ? "text" : "password"}
                          value={folderModal.data.password || ''}
                          onChange={e => setFolderModal(prev => ({ ...prev, data: { ...prev.data, password: e.target.value } }))}
                          className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pr-10 text-white focus:border-red-500/50 focus:outline-none"
                          placeholder="Required for access"
                      />
                      <button
                          type="button"
                          onClick={() => setShowFolderPassword(!showFolderPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                          {showFolderPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                 </div>
               )}

               {/* Verification Input UI for Private -> Public Switch */}
               {showVerification && (
                  <div className={`animate-in slide-in-from-top-2 p-4 rounded-xl mt-4 border ${verificationStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/20'}`}>
                      <label className={`text-xs font-bold uppercase ml-1 block mb-2 ${verificationStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>Verify Password to Make Public</label>
                      <div className="relative">
                        <input 
                            type="password"
                            value={verifyPassword}
                            onChange={e => setVerifyPassword(e.target.value)}
                            className={`w-full bg-black/40 border ${verificationStatus === 'error' ? 'border-red-500' : (verificationStatus === 'success' ? 'border-emerald-500' : 'border-red-500/30')} rounded-xl p-3 text-white focus:outline-none pr-10 transition-colors`}
                            placeholder="Current Folder Password"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                             {verificationStatus === 'validating' && <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />}
                             {verificationStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in duration-300" />}
                             {verificationStatus === 'error' && <XCircle className="w-5 h-5 text-red-400 animate-in zoom-in duration-300" />}
                        </div>
                      </div>
                      {verificationStatus === 'error' && <p className="text-red-400 text-xs mt-2 ml-1 font-medium animate-in slide-in-from-top-1">Incorrect password</p>}
                  </div>
               )}

               <button 
                  onClick={handleSaveFolder}
                  disabled={!folderModal.data.name || (folderModal.data.type === 'private' && !folderModal.data.password) || (showVerification && verificationStatus !== 'success')}
                  className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {folderModal.mode === 'create' ? 'Create Folder' : 'Save Changes'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authFolderId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAuthFolderId(null)} />
          <div className="relative w-full max-w-sm glass-panel rounded-[2.5rem] p-8 border border-white/10 border-t-red-500/20 shadow-2xl animate-in zoom-in-95">
             <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-400" />
             </div>
             <h3 className="text-xl font-bold text-white text-center mb-2">Locked Vault</h3>
             <p className="text-zinc-400 text-center text-sm mb-6">Enter password to access this folder.</p>
             
             <form onSubmit={handleAuthSubmit}>
                <input 
                    type="password" 
                    value={passwordInput}
                    onChange={e => { setPasswordInput(e.target.value); setAuthError(false); }}
                    className={`w-full bg-black/20 border ${authError ? 'border-red-500' : 'border-white/10'} rounded-xl p-3 text-white focus:outline-none text-center tracking-widest mb-4`}
                    placeholder="••••••"
                    autoFocus
                />
                {authError && <p className="text-red-400 text-xs text-center mb-4">Incorrect password</p>}
                <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200">
                    Unlock
                </button>
             </form>
          </div>
        </div>
      )}
      
      {/* Delete Folder Modal */}
      <DeleteConfirmModal 
        isOpen={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={confirmDeleteFolder}
        title="Delete Folder?"
        description="Are you sure you want to remove this folder and all items inside? This action cannot be undone."
      />

      {/* Vault Browser (Inner Grid) */}
      {openFolderId && activeFolder && (
        <div 
            className="fixed inset-0 z-[90] flex flex-col animate-in slide-in-from-bottom duration-500 transition-colors"
            style={getBackgroundStyle()}
        >
           {/* Overlay for Image Themes */}
            {theme.type === 'image' && (
                <div className="absolute inset-0 bg-black/60 pointer-events-none z-0 backdrop-blur-[4px]" />
            )}
            {/* Ambient Background for non-image */}
            {theme.type !== 'image' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-lg pointer-events-none z-0" />
            )}

           {/* Header */}
           <div className="pt-8 pb-4 px-4 md:px-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-[#09090b]/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg gap-4">
              <div className="flex items-center gap-4 relative z-10 flex-shrink-0">
                  <button onClick={() => onOpenFolder(null)} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white">
                     <ArrowRight className="w-6 h-6 rotate-180" />
                  </button>
                  <div>
                     <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {activeFolder.type === 'private' && <Lock className="w-5 h-5 text-red-400" />}
                        {activeFolder.name}
                     </h2>
                     <p className="text-zinc-400 text-xs font-medium">Vault Browser</p>
                  </div>
              </div>

              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
                  {/* Search Bar */}
                  <div className="flex-1 md:flex-none flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-2 focus-within:bg-black/40 focus-within:border-emerald-500/50 transition-all max-w-xs">
                    <Search className="w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vault..."
                        className="bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-zinc-600 ml-2 w-full md:w-40"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                  </div>

                  {!isSharedMode && (
                    <>
                        <div className="h-6 w-px bg-white/10 hidden md:block" />

                        <div className="flex items-center gap-2 flex-shrink-0">
                            
                            {/* Multi-Select Delete Trigger in Header */}
                            {isVaultEditing && selectedVaultItemIds.length > 0 && (
                                <button
                                    onClick={handleBulkDeleteTrigger}
                                    className="p-2.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-in zoom-in mr-1"
                                    title={`Delete ${selectedVaultItemIds.length} Items`}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <button 
                                onClick={() => setIsVaultEditing(!isVaultEditing)}
                                className={`p-2.5 rounded-full transition-all ${isVaultEditing ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                                title="Toggle Edit Mode"
                            >
                                {isVaultEditing ? <Check className="w-5 h-5" /> : <SquarePen className="w-5 h-5" />}
                            </button>
                            
                            <button 
                                onClick={() => setIsAddingItem(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden md:inline">Add Item</span>
                            </button>
                        </div>
                    </>
                  )}
              </div>
           </div>

           {/* Grid Content */}
           <div className="flex-1 overflow-y-auto p-4 md:p-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-6 pb-20">
                 {filteredItems?.map(block => (
                    <BentoItem 
                       key={block.id}
                       block={block}
                       isEditing={isVaultEditing && !isSharedMode} 
                       isSelected={selectedVaultItemIds.includes(block.id)}
                       onRemove={handleRemoveBlock}
                       onResize={handleResizeBlock}
                       onEditContent={setEditingBlock}
                       onMove={handleMoveBlock}
                       onUpdate={(id, updates) => handleUpdateBlock({ ...block, ...updates, id } as BlockData)}
                       onToggleSelect={handleVaultItemInteraction}
                       onItemClick={handleItemClick}
                    />
                 ))}
                 {filteredItems?.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-white/10 rounded-[2rem] bg-black/20">
                        {searchQuery ? (
                            <>
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p>No items match "{searchQuery}"</p>
                            </>
                        ) : (
                            <>
                                <Shield className="w-12 h-12 mb-4 opacity-20" />
                                <p>This folder is empty. {isSharedMode ? 'Add items using the button above.' : ''}</p>
                            </>
                        )}
                    </div>
                 )}
              </div>
           </div>

           {/* Modals for Inner Grid */}
           <VaultAddItemModal 
             isOpen={isAddingItem} 
             onClose={() => setIsAddingItem(false)}
             onAdd={handleAddBlockData}
             onOpenNoteStudio={() => setNotePage({ isOpen: true, data: null, mode: 'create' })}
           />
           
           <VaultEditItemModal 
              isOpen={!!editingBlock}
              block={editingBlock}
              onClose={() => setEditingBlock(null)}
              onSave={handleUpdateBlock}
              onOpenNoteStudio={(block) => setNotePage({ isOpen: true, data: block, mode: 'edit' })}
           />
           
           <DeleteConfirmModal 
              isOpen={!!blockToDelete}
              onClose={() => { setBlockToDelete(null); setIsBulkDeleteVault(false); }}
              onConfirm={confirmRemoveBlock}
              count={isBulkDeleteVault ? selectedVaultItemIds.length : 1}
           />

           {/* Document Preview Modal */}
           <DocumentPreviewModal 
              isOpen={!!previewDocument}
              block={previewDocument}
              onClose={() => setPreviewDocument(null)}
           />

           {/* Full Screen Note Studio */}
           <VaultNotePage 
              isOpen={notePage.isOpen}
              initialData={notePage.data}
              onSave={handleSaveNote}
              onClose={() => setNotePage({ isOpen: false, data: null, mode: 'create' })}
           />
        </div>
      )}
    </div>
  );
};
