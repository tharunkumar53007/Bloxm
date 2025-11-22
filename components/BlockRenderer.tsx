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
  Link as LinkIcon
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
  link: LinkIcon
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
      default: return 'text-zinc-200';
  }
};

const formatLastUpdated = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
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
        {Icon && (
          <Icon 
            className={`w-10 h-10 mb-2 transition-transform duration-300 relative z-10 group-hover:scale-110 ${hasBanner ? 'text-white drop-shadow-lg' : brandColorClass}`} 
          />
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
    return (
      <div className="flex flex-col justify-between h-full p-6 relative group overflow-hidden">
         {/* Banner Background */}
         {hasBanner && (
          <>
             <img 
                src={block.imageUrl} 
                alt="" 
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-all duration-700" 
             />
             <div className="absolute inset-0 bg-gradient-to-br from-black/95 to-black/40" />
          </>
        )}

         {!hasBanner && (
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-zinc-100/5 blur-3xl rounded-full group-hover:bg-zinc-100/10 transition-colors duration-500" />
         )}

         <div className="relative z-10 w-full h-full flex flex-col">
          <h3 className="text-xl font-bold text-zinc-100 mb-2 drop-shadow-md">{block.title}</h3>
          <p className="text-zinc-300 text-sm leading-relaxed drop-shadow-md font-medium line-clamp-4 flex-grow">{block.content}</p>
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