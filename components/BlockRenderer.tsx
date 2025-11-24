
import React from 'react';
import { BlockData } from '../types';
import { 
  Github, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  ArrowUpRight, 
  MapPin,
  Music,
  Globe,
  Code,
  Youtube,
  Twitch,
  Facebook,
  AudioLines,
  Video,
  Tag,
  Link as LinkIcon,
  FileText
} from 'lucide-react';

interface BlockRendererProps {
  block: BlockData;
}

const IconMap: Record<string, React.FC<any>> = {
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  mail: Mail,
  music: Music,
  spotify: AudioLines,
  globe: Globe,
  code: Code,
  youtube: Youtube,
  twitch: Twitch,
  facebook: Facebook,
  video: Video,
  link: LinkIcon,
  'file-text': FileText
};

const getBrandColor = (name?: string) => {
  switch(name?.toLowerCase()) {
      case 'twitter': return 'text-sky-400';
      case 'github': return 'text-white';
      case 'youtube': return 'text-red-500';
      case 'instagram': return 'text-pink-500';
      case 'linkedin': return 'text-blue-500'; 
      case 'spotify': return 'text-green-400';
      case 'music': return 'text-green-400';
      case 'twitch': return 'text-purple-400';
      case 'facebook': return 'text-blue-400';
      case 'video': return 'text-rose-400';
      case 'link': return 'text-indigo-400';
      case 'file-text': return 'text-amber-200';
      default: return 'text-zinc-200';
  }
};

const formatLastUpdated = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getFileExtension = (block: BlockData): string => {
    if (block.content && block.content.includes('.')) {
        const parts = block.content.split('.');
        const ext = parts.pop();
        // Basic check to ensure it looks like an extension (2-4 chars usually)
        if (ext && ext.length >= 2 && ext.length <= 4) return ext.toUpperCase();
    }
    if (block.url && block.url.includes('.')) {
        try {
            const url = new URL(block.url);
            const pathname = url.pathname;
            if (pathname.includes('.')) {
                const ext = pathname.split('.').pop();
                if (ext && ext.length < 6) return ext.toUpperCase();
            }
        } catch (e) {}
    }
    return 'FILE';
};

const getDocumentTheme = (ext: string) => {
  const e = ext.toLowerCase();
  
  // PDF - Premium Red / Crimson
  if (e === 'pdf') return {
    bgGradient: 'from-[#450a0a] via-[#7f1d1d] to-[#991b1b]',
    blobColor: 'bg-red-500',
    glassBorder: 'border-red-500/30',
    glassBg: 'bg-red-950/30',
    textAccent: 'text-red-200',
    badgeBg: 'bg-gradient-to-br from-red-500/20 to-red-900/40',
    badgeBorder: 'border-red-400/30',
    iconColor: 'text-red-400'
  };

  // Word / Docs - Premium Blue
  if (['doc', 'docx'].includes(e)) return {
    bgGradient: 'from-[#172554] via-[#1e40af] to-[#1d4ed8]',
    blobColor: 'bg-blue-500',
    glassBorder: 'border-blue-500/30',
    glassBg: 'bg-blue-950/30',
    textAccent: 'text-blue-200',
    badgeBg: 'bg-gradient-to-br from-blue-500/20 to-blue-900/40',
    badgeBorder: 'border-blue-400/30',
    iconColor: 'text-blue-400'
  };

  // Excel / Sheets - Premium Emerald
  if (['xls', 'xlsx', 'csv'].includes(e)) return {
    bgGradient: 'from-[#064e3b] via-[#059669] to-[#10b981]',
    blobColor: 'bg-emerald-500',
    glassBorder: 'border-emerald-500/30',
    glassBg: 'bg-emerald-950/30',
    textAccent: 'text-emerald-200',
    badgeBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/40',
    badgeBorder: 'border-emerald-400/30',
    iconColor: 'text-emerald-400'
  };

  // PowerPoint - Premium Orange/Amber
  if (['ppt', 'pptx'].includes(e)) return {
    bgGradient: 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]',
    blobColor: 'bg-orange-500',
    glassBorder: 'border-orange-500/30',
    glassBg: 'bg-orange-950/30',
    textAccent: 'text-orange-200',
    badgeBg: 'bg-gradient-to-br from-orange-500/20 to-orange-900/40',
    badgeBorder: 'border-orange-400/30',
    iconColor: 'text-orange-400'
  };

  // Archives - Premium Gold/Yellow
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return {
    bgGradient: 'from-[#713f12] via-[#a16207] to-[#ca8a04]',
    blobColor: 'bg-yellow-500',
    glassBorder: 'border-yellow-500/30',
    glassBg: 'bg-yellow-950/30',
    textAccent: 'text-yellow-200',
    badgeBg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-900/40',
    badgeBorder: 'border-yellow-400/30',
    iconColor: 'text-yellow-400'
  };

  // Images - Premium Violet/Purple
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(e)) return {
    bgGradient: 'from-[#4c1d95] via-[#7c3aed] to-[#8b5cf6]',
    blobColor: 'bg-purple-500',
    glassBorder: 'border-purple-500/30',
    glassBg: 'bg-purple-950/30',
    textAccent: 'text-purple-200',
    badgeBg: 'bg-gradient-to-br from-purple-500/20 to-purple-900/40',
    badgeBorder: 'border-purple-400/30',
    iconColor: 'text-purple-400'
  };

   // Audio - Premium Pink
  if (['mp3', 'wav', 'ogg', 'flac'].includes(e)) return {
    bgGradient: 'from-[#831843] via-[#db2777] to-[#f472b6]',
    blobColor: 'bg-pink-500',
    glassBorder: 'border-pink-500/30',
    glassBg: 'bg-pink-950/30',
    textAccent: 'text-pink-200',
    badgeBg: 'bg-gradient-to-br from-pink-500/20 to-pink-900/40',
    badgeBorder: 'border-pink-400/30',
    iconColor: 'text-pink-400'
  };

  // Code - Premium Slate/Cyan
  if (['js', 'ts', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(e)) return {
    bgGradient: 'from-[#0f172a] via-[#334155] to-[#475569]',
    blobColor: 'bg-cyan-500',
    glassBorder: 'border-cyan-500/30',
    glassBg: 'bg-slate-900/30',
    textAccent: 'text-cyan-200',
    badgeBg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-900/40',
    badgeBorder: 'border-cyan-400/30',
    iconColor: 'text-cyan-400'
  };

  // Default / Text - Premium Zinc/Dark
  return {
    bgGradient: 'from-[#18181b] via-[#27272a] to-[#3f3f46]',
    blobColor: 'bg-zinc-500',
    glassBorder: 'border-zinc-600/30',
    glassBg: 'bg-zinc-900/30',
    textAccent: 'text-zinc-200',
    badgeBg: 'bg-gradient-to-br from-white/5 to-white/10',
    badgeBorder: 'border-white/10',
    iconColor: 'text-zinc-400'
  };
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  // Logic to render documents specifically without the banner
  const isDocument = block.tags?.includes('document');

  const renderDocument = () => {
    const ext = getFileExtension(block);
    const theme = getDocumentTheme(ext);
    
    return (
        <div className={`flex flex-col items-center justify-center h-full w-full p-4 group relative overflow-hidden transition-all duration-500`}>
            {/* Base Deep Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-90 transition-all duration-700`} />
            
            {/* Liquid Ambient Blobs */}
            <div className={`absolute top-[-50%] left-[-20%] w-[150%] h-[150%] ${theme.blobColor} opacity-20 blur-[80px] rounded-full animate-float mix-blend-overlay`} />
            <div className={`absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] ${theme.blobColor} opacity-10 blur-[60px] rounded-full animate-float-delayed mix-blend-overlay`} />

            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            {/* Glass Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full">
                {/* Premium Glass Badge for Extension */}
                <div className={`
                    w-16 h-16 mb-3 rounded-2xl 
                    ${theme.badgeBg} ${theme.badgeBorder} border 
                    flex items-center justify-center 
                    shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                    group-hover:scale-110 group-hover:-translate-y-1
                    transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                    backdrop-blur-md relative overflow-hidden
                `}>
                    {/* Inner Badge Shine */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                    
                    <span className={`text-lg font-black tracking-wider ${theme.textAccent} relative z-10 drop-shadow-md`}>{ext}</span>
                </div>
                
                {/* Title with improved typography */}
                <span className={`text-sm font-bold text-white/90 group-hover:text-white transition-colors text-center line-clamp-2 px-1 drop-shadow-md w-full break-words leading-tight min-h-[2.5em] flex items-center justify-center`}>
                    {block.title || "Document"}
                </span>

                {/* File Size / Type hint (Mocked or calculated) */}
                <div className={`
                    mt-3 flex items-center gap-1.5 
                    text-[10px] font-bold uppercase tracking-widest ${theme.textAccent}
                    opacity-60 group-hover:opacity-100 transition-all duration-300
                `}>
                   <div className={`w-1.5 h-1.5 rounded-full ${theme.blobColor} shadow-[0_0_5px_currentColor]`} />
                   {ext} FILE
                </div>
                
                {/* Hover "Preview" Action - Subtle Pill */}
                <div className={`
                   absolute bottom-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                   transition-all duration-300 ease-out
                   bg-black/40 backdrop-blur-md border border-white/10
                   px-3 py-1.5 rounded-full flex items-center gap-1.5
                   shadow-lg
                `}>
                    <FileText className={`w-3 h-3 ${theme.textAccent}`} />
                    <span className="text-[10px] font-semibold text-white">Preview</span>
                </div>
            </div>
        </div>
    );
  };

  if (isDocument) {
      return renderDocument();
  }

  const renderSocial = () => {
    const Icon = block.iconName ? IconMap[block.iconName.toLowerCase()] : Globe;
    const hasBanner = !!block.imageUrl;
    const brandColorClass = getBrandColor(block.iconName);
    const hasTags = block.tags && block.tags.length > 0;

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 group relative overflow-hidden">
        {/* Banner Background */}
        {hasBanner && (
          <>
             <img 
                src={block.imageUrl} 
                alt="" 
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Icon */}
        {block.faviconUrl ? (
            <img 
              src={block.faviconUrl} 
              alt="Icon"
              className={`w-10 h-10 mb-2 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md rounded-md`}
            />
        ) : (
            Icon && (
              <Icon 
                className={`w-10 h-10 mb-2 transition-transform duration-300 relative z-10 group-hover:scale-110 ${hasBanner ? 'text-white drop-shadow-lg' : brandColorClass}`} 
              />
            )
        )}
        
        <span className={`text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors relative z-10 drop-shadow-md text-center line-clamp-2 ${hasTags ? 'mb-1' : ''}`}>
          {block.title}
        </span>

        {/* Tags Display */}
        {hasTags && (
          <div className="flex flex-wrap justify-center gap-1 mt-2 relative z-10">
            {block.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/5">
                <Tag className="w-3 h-3 opacity-50" />
                {tag}
              </span>
            ))}
            {(block.tags?.length || 0) > 2 && (
              <span className="text-[10px] text-zinc-500 px-1">+{ (block.tags?.length || 0) - 2 }</span>
            )}
          </div>
        )}
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const hasImage = !!block.imageUrl;
    const initial = (block.title || 'User').charAt(0).toUpperCase();

    return (
      <div className="flex flex-col justify-between h-full p-6 md:p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
         <div className="z-10">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500 relative bg-black/20 backdrop-blur-md">
            {hasImage ? (
              <img src={block.imageUrl} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                  {/* Aesthetic Liquid Glass Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
                  
                  {/* Aesthetic Glass Text */}
                  <span 
                    className="text-5xl relative z-10 select-none"
                    style={{ 
                        fontFamily: "'Grand Hotel', cursive",
                        background: 'linear-gradient(135deg, #ffffff 30%, #6ee7b7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 15px rgba(52, 211, 153, 0.4))'
                    }}
                  >
                    {initial}
                  </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">{block.title}</h1>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-md drop-shadow-sm">{block.content}</p>
        </div>
        <div className="mt-4 flex gap-2 z-10">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
              {block.status || "Available for work"}
           </span>
        </div>
      </div>
    );
  };

  const renderText = () => {
    const hasBanner = !!block.imageUrl;
    // Map status to background color for Notes
    const colorMap: Record<string, string> = {
        'red': 'bg-gradient-to-br from-red-900/40 via-red-950/20 to-black/40 border-red-500/20',
        'orange': 'bg-gradient-to-br from-orange-900/40 via-orange-950/20 to-black/40 border-orange-500/20',
        'yellow': 'bg-gradient-to-br from-yellow-900/40 via-yellow-950/20 to-black/40 border-yellow-500/20',
        'green': 'bg-gradient-to-br from-emerald-900/40 via-emerald-950/20 to-black/40 border-emerald-500/20',
        'teal': 'bg-gradient-to-br from-teal-900/40 via-teal-950/20 to-black/40 border-teal-500/20',
        'blue': 'bg-gradient-to-br from-blue-900/40 via-blue-950/20 to-black/40 border-blue-500/20',
        'purple': 'bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-black/40 border-purple-500/20',
        'pink': 'bg-gradient-to-br from-pink-900/40 via-pink-950/20 to-black/40 border-pink-500/20',
    };

    // If it has a banner, render the Premium "Note Style" Layout (Notion-esque cover)
    if (hasBanner) {
         return (
             <div className="flex flex-col h-full w-full bg-zinc-900 group relative overflow-hidden border border-white/5">
                {/* Header Image */}
                <div className="h-1/3 min-h-[60px] w-full relative overflow-hidden bg-black">
                    <img 
                        src={block.imageUrl} 
                        alt="Banner" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Shadow gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
                </div>

                {/* Content Body */}
                <div className="flex-1 p-5 pt-3 flex flex-col relative min-h-0">
                     {/* Floating Badge for Tags if any */}
                     {block.tags && block.tags.length > 0 && (
                        <div className="absolute -top-3 right-4 z-10">
                            <span className="bg-zinc-800/90 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-white/5 shadow-lg shadow-black/20">
                                #{block.tags[0]}
                            </span>
                        </div>
                     )}

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 drop-shadow-md">{block.title}</h3>
                    <div 
                        className="text-zinc-400 text-xs leading-relaxed line-clamp-3 prose prose-invert prose-p:my-0 break-words"
                        dangerouslySetInnerHTML={{ __html: block.content || '' }}
                    />
                    
                    {/* Footer Info */}
                    <div className="mt-auto pt-4 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity border-t border-white/5">
                        <span className="text-[10px] text-zinc-500 font-medium">Updated {formatLastUpdated(block.lastUpdated)}</span>
                        {block.url && <ArrowUpRight className="w-3 h-3 text-zinc-500" />}
                    </div>
                </div>
             </div>
        );
    }

    // Default or Colored Note Style (No Image)
    const bgColor = block.status && colorMap[block.status] ? colorMap[block.status] : '';

    return (
      <div className={`flex flex-col justify-between h-full p-6 relative group overflow-hidden ${bgColor ? `${bgColor} border` : ''}`}>
         {!bgColor && (
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-zinc-100/5 blur-3xl rounded-full group-hover:bg-zinc-100/10 transition-colors duration-500" />
         )}

         <div className="relative z-10 w-full h-full flex flex-col">
          <h3 className="text-xl font-bold text-zinc-100 mb-2 drop-shadow-md">{block.title}</h3>
          <div 
            className="text-zinc-300 text-sm leading-relaxed drop-shadow-md font-medium line-clamp-4 flex-grow prose prose-invert max-w-none prose-p:my-1 prose-headings:my-1"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
         </div>
         {block.url && (
           <div className="relative z-10 flex items-center gap-2 mt-4 text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
             Read more <ArrowUpRight className="w-3 h-3" />
           </div>
         )}
         
         {/* Last Updated Timestamp */}
         {block.lastUpdated && (
            <div className="absolute top-4 right-4 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5 select-none cursor-default">
               Updated {formatLastUpdated(block.lastUpdated)}
            </div>
         )}
         
         {/* Tags Display (for Notes) */}
         {block.tags && block.tags.length > 0 && !hasBanner && (
           <div className="relative z-10 flex flex-wrap gap-1 mt-3">
             {block.tags.map((tag, i) => (
               <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                 #{tag}
               </span>
             ))}
           </div>
         )}
      </div>
    );
  };

  const renderImage = () => (
    <div className="w-full h-full relative group overflow-hidden">
      <img 
        src={block.imageUrl} 
        alt={block.title} 
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 p-4 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-bold text-lg truncate drop-shadow-lg">{block.title}</p>
        <p className="text-zinc-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-300 drop-shadow-md">{block.content}</p>
      </div>
      {/* Last Updated Timestamp */}
      {block.lastUpdated && (
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[10px] text-zinc-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 select-none cursor-default shadow-sm">
           Updated {formatLastUpdated(block.lastUpdated)}
        </div>
      )}
    </div>
  );

  const renderMap = () => (
    <div className="w-full h-full relative overflow-hidden group">
      {/* Abstract Map Representation */}
      <div className="absolute inset-0 bg-[#151518] opacity-100" />
      <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', 
          backgroundSize: '20px 20px',
          opacity: 0.2 
        }} 
      />
      {/* Simulated Roads/Paths */}
      <div className="absolute top-0 left-1/3 w-2 h-full bg-zinc-700/30 -rotate-12 blur-[1px]" />
      <div className="absolute top-1/2 left-0 w-full h-2 bg-zinc-700/30 rotate-3 blur-[1px]" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute inset-0 opacity-75"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white relative z-10 shadow-lg shadow-blue-500/50"></div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-800/50 flex items-center gap-2 shadow-lg">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-xs font-semibold text-zinc-200">{block.title || "San Francisco, CA"}</span>
      </div>
    </div>
  );

  switch (block.type) {
    case 'profile': return renderProfile();
    case 'social': return renderSocial();
    case 'image': return renderImage();
    case 'map': return renderMap();
    case 'text': return renderText();
    default: return renderText();
  }
};
