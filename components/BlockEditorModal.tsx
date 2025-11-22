import React, { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon, Image as ImageIcon, Type, AlertCircle, Upload, Activity } from 'lucide-react';
import { BlockData } from '../types';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBlock: BlockData) => void;
  block: BlockData | null;
}

export const BlockEditorModal: React.FC<BlockEditorModalProps> = ({ isOpen, onClose, onSave, block }) => {
  const [formData, setFormData] = useState<Partial<BlockData>>({});

  useEffect(() => {
    if (block) {
      setFormData({ ...block });
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const isProfile = block.type === 'profile';

  const detectIconFromUrl = (url: string): string | null => {
    const u = url.toLowerCase();
    if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
    if (u.includes('github.com')) return 'github';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('instagram.com')) return 'instagram';
    if (u.includes('linkedin.com')) return 'linkedin';
    if (u.includes('twitch.tv')) return 'twitch';
    if (u.includes('facebook.com')) return 'facebook';
    if (u.includes('spotify.com') || u.includes('open.spotify.com')) return 'spotify';
    if (u.includes('music.apple.com')) return 'music';
    if (u.includes('mailto:')) return 'mail';
    return null;
  };

  const handleChange = (key: keyof BlockData, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'url' && !isProfile) {
        const detectedIcon = detectIconFromUrl(value);
        if (detectedIcon) {
          next.iconName = detectedIcon;
        }
      }
      return next;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ ...block, ...formData } as BlockData);
    onClose();
  };

  // Visual Styles
  const labelStyle = "block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest ml-1";
  const inputGroupStyle = "relative group";
  const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors";
  const inputStyle = "w-full bg-zinc-950/80 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-black focus:outline-none transition-all shadow-inner";
  const textareaStyle = "w-full h-32 bg-zinc-950/80 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-black focus:outline-none transition-all shadow-inner resize-none leading-relaxed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Darker Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-[420px] glass-panel rounded-[2rem] p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 bg-[#09090b]/90">
        
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white tracking-tight">Edit {isProfile ? 'Profile' : 'Block'}</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Title Input */}
          <div>
            <label className={labelStyle}>{isProfile ? 'Display Name' : 'Title'}</label>
            <div className={inputGroupStyle}>
              <Type className={iconStyle} />
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className={inputStyle}
                placeholder="Block Title"
              />
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className={labelStyle}>{isProfile ? 'Bio / Introduction' : 'Content'}</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              className={textareaStyle}
              placeholder="Enter text content..."
            />
          </div>

          {/* Status Input (Profile Only) */}
          {isProfile && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelStyle}>Current Status</label>
              <div className={inputGroupStyle}>
                <Activity className={iconStyle} />
                <input
                  type="text"
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={inputStyle}
                  placeholder="e.g. Available for work"
                />
              </div>
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className={labelStyle}>Link Attachment</label>
            <div className={inputGroupStyle}>
              <LinkIcon className={iconStyle} />
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className={inputStyle}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image URL Input with Upload */}
          <div>
            <label className={labelStyle}>{isProfile ? 'Profile Photo' : 'Banner / Background'}</label>
            <div className="flex gap-3">
              <div className={`${inputGroupStyle} flex-1`}>
                <ImageIcon className={iconStyle} />
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  className={inputStyle}
                  placeholder="https://... or upload ->"
                />
              </div>
              <label className="cursor-pointer bg-zinc-950/80 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl w-[50px] flex items-center justify-center transition-colors group" title="Upload Image">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <Upload className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              </label>
            </div>
          </div>
          
          {/* Icon Name (Only if not profile) */}
           {!isProfile && (
            <div>
              <label className={labelStyle}>Icon Name</label>
              <div className={inputGroupStyle}>
                <AlertCircle className={iconStyle} />
                <input
                  type="text"
                  value={formData.iconName || ''}
                  onChange={(e) => handleChange('iconName', e.target.value)}
                  className={inputStyle}
                  placeholder="twitter, youtube..."
                />
              </div>
            </div>
           )}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 pt-4">
          <button 
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};