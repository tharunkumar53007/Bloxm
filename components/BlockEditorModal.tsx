
import React, { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon, Image as ImageIcon, Type, AlertCircle, Upload, Activity, MapPin, Navigation, Globe, List, ListOrdered, Plus, Trash2, User, Hash, Twitter, Github, Linkedin, Facebook, Instagram, Youtube, Twitch, Music, Mail, FileText } from 'lucide-react';
import { BlockData, BlockType } from '../types';

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
      // Auto-detect icon for Social blocks only
      if (block.type === 'social' && key === 'url') {
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
  
  // List Logic
  const handleListItemChange = (index: number, value: string) => {
      const currentItems = [...(formData.items || [])];
      currentItems[index] = value;
      setFormData(prev => ({ ...prev, items: currentItems }));
  };

  const handleAddListItem = () => {
      setFormData(prev => ({ ...prev, items: [...(prev.items || []), ''] }));
  };

  const handleRemoveListItem = (index: number) => {
      const currentItems = [...(formData.items || [])];
      currentItems.splice(index, 1);
      setFormData(prev => ({ ...prev, items: currentItems }));
  };

  const toggleListType = () => {
      setFormData(prev => ({ ...prev, listType: prev.listType === 'ordered' ? 'unordered' : 'ordered' }));
  };

  const handleSave = () => {
    onSave({ ...block, ...formData } as BlockData);
    onClose();
  };

  // --- Styles ---
  const labelStyle = "block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest ml-1";
  const inputGroupStyle = "relative group";
  const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none";
  const inputStyle = "w-full bg-zinc-950/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-black focus:outline-none transition-all shadow-inner";
  const textareaStyle = "w-full h-32 bg-zinc-950/50 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-black focus:outline-none transition-all shadow-inner resize-none leading-relaxed";

  // --- Render Helpers ---

  const renderSocialIconPreview = () => {
      const iconName = formData.iconName || 'globe';
      const map: any = { twitter: Twitter, github: Github, linkedin: Linkedin, facebook: Facebook, instagram: Instagram, youtube: Youtube, twitch: Twitch, spotify: Music, music: Music, mail: Mail, globe: Globe };
      const IconComp = map[iconName.toLowerCase()] || Globe;
      
      return (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <IconComp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Platform Detected</div>
                  <div className="text-white font-medium truncate">{iconName.charAt(0).toUpperCase() + iconName.slice(1)}</div>
              </div>
          </div>
      );
  };

  const renderProfileEditor = () => (
      <div className="space-y-5">
           {/* Avatar Upload */}
           <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-emerald-500/50 transition-colors shadow-xl bg-zinc-900">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <User className="w-10 h-10 text-zinc-500" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <label className="absolute inset-0 cursor-pointer" title="Upload Avatar">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-wider">Tap to change</span>
           </div>

           <div>
                <label className={labelStyle}>Display Name</label>
                <div className={inputGroupStyle}>
                    <User className={iconStyle} />
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={inputStyle}
                        placeholder="e.g. John Doe"
                    />
                </div>
           </div>

           <div>
                <label className={labelStyle}>Bio / Intro</label>
                <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className={`${textareaStyle} !h-24`}
                    placeholder="Tell your story..."
                />
           </div>

           <div>
                <label className={labelStyle}>Status Label</label>
                <div className={inputGroupStyle}>
                    <Activity className={iconStyle} />
                    <input
                        type="text"
                        value={formData.status || ''}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className={inputStyle}
                        placeholder="e.g. Open to work"
                    />
                </div>
           </div>
      </div>
  );

  const renderSocialEditor = () => (
      <div className="space-y-5">
           {renderSocialIconPreview()}
           
           <div>
                <label className={labelStyle}>Link URL</label>
                <div className={inputGroupStyle}>
                    <LinkIcon className={iconStyle} />
                    <input
                        type="url"
                        value={formData.url || ''}
                        onChange={(e) => handleChange('url', e.target.value)}
                        className={inputStyle}
                        placeholder="https://twitter.com/..."
                        autoFocus
                    />
                </div>
           </div>

           <div>
                <label className={labelStyle}>Label (Optional)</label>
                <div className={inputGroupStyle}>
                    <Type className={iconStyle} />
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={inputStyle}
                        placeholder="e.g. Follow me on X"
                    />
                </div>
           </div>
           
           <div>
               <label className={labelStyle}>Manual Icon Override</label>
               <div className={inputGroupStyle}>
                   <Hash className={iconStyle} />
                   <input
                       type="text"
                       value={formData.iconName || ''}
                       onChange={(e) => handleChange('iconName', e.target.value)}
                       className={inputStyle}
                       placeholder="twitter, github, globe..."
                   />
               </div>
           </div>
      </div>
  );

  const renderMapEditor = () => (
      <div className="space-y-5">
            {/* Map Preview */}
             <div className="w-full h-36 rounded-2xl overflow-hidden relative mb-2 border border-white/10 group shadow-inner bg-[#151518]">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* Simulated Roads */}
                <div className="absolute top-0 left-1/3 w-2 h-full bg-zinc-700/30 -rotate-12 blur-[1px]" />
                <div className="absolute top-1/2 left-0 w-full h-2 bg-zinc-700/30 rotate-3 blur-[1px]" />
                
                {/* Pin */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute inset-0 opacity-75"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white relative z-10 shadow-lg shadow-blue-500/50"></div>
                    </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/50 flex items-center gap-2 shadow-lg max-w-[85%]">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-200 truncate">{formData.title || "Location Name"}</span>
                </div>
             </div>

             <div>
                <label className={labelStyle}>Place Name</label>
                <div className={inputGroupStyle}>
                    <Navigation className={iconStyle} />
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={inputStyle}
                        placeholder="e.g. HQ, Home, Fav Cafe"
                    />
                </div>
            </div>

            <div>
                <label className={labelStyle}>Display Address</label>
                <div className={inputGroupStyle}>
                    <MapPin className={iconStyle} />
                    <input
                        type="text"
                        value={formData.content || ''}
                        onChange={(e) => handleChange('content', e.target.value)}
                        className={inputStyle}
                        placeholder="e.g. 123 Market St, San Francisco"
                    />
                </div>
            </div>

            <div>
                <label className={labelStyle}>Google Maps Link</label>
                <div className={inputGroupStyle}>
                    <Globe className={iconStyle} />
                    <input
                        type="url"
                        value={formData.url || ''}
                        onChange={(e) => handleChange('url', e.target.value)}
                        className={inputStyle}
                        placeholder="https://maps.google.com/..."
                    />
                </div>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1">
                    Open Google Maps to find link <LinkIcon className="w-3 h-3" />
                </a>
            </div>
      </div>
  );

  const renderListEditor = () => (
      <div className="space-y-4">
          <div>
                <label className={labelStyle}>List Title</label>
                <div className={inputGroupStyle}>
                    <Type className={iconStyle} />
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={inputStyle}
                        placeholder="e.g. My Goals"
                    />
                </div>
          </div>

          <div className="flex justify-between items-center mt-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Items</label>
                <button 
                    onClick={toggleListType}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg border border-yellow-500/20 transition-all active:scale-95"
                >
                    {formData.listType === 'ordered' ? <ListOrdered className="w-3 h-3"/> : <List className="w-3 h-3"/>}
                    {formData.listType === 'ordered' ? 'Numbered' : 'Bulleted'}
                </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {(formData.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center group/item animate-in slide-in-from-left-2 fade-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-mono font-bold">
                                {formData.listType === 'ordered' ? `${idx + 1}.` : '•'}
                            </span>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleListItemChange(idx, e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 pl-8 pr-3 text-sm text-white focus:border-yellow-500/50 focus:bg-black focus:outline-none transition-all"
                                placeholder="List item..."
                            />
                        </div>
                        <button 
                            onClick={() => handleRemoveListItem(idx)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button 
                onClick={handleAddListItem}
                className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 text-xs font-bold flex items-center justify-center gap-2 transition-all group"
            >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add New Item
            </button>
      </div>
  );

  const renderImageEditor = () => (
      <div className="space-y-5">
           {/* Image Preview / Upload Area */}
           <div className="w-full aspect-square md:aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative group">
                {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium">No Image Selected</span>
                    </div>
                )}
                
                {/* Overlay Upload Trigger */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                    <Upload className="w-8 h-8 text-white mb-2" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Upload New</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
           </div>

           <div>
                <label className={labelStyle}>Image URL (Or Upload Above)</label>
                <div className={inputGroupStyle}>
                    <LinkIcon className={iconStyle} />
                    <input
                        type="text"
                        value={formData.imageUrl || ''}
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        className={inputStyle}
                        placeholder="https://..."
                    />
                </div>
           </div>

           <div>
                <label className={labelStyle}>Caption / Title</label>
                <div className={inputGroupStyle}>
                    <Type className={iconStyle} />
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={inputStyle}
                        placeholder="Image Caption"
                    />
                </div>
           </div>
           
           <div>
                <label className={labelStyle}>Description (On Hover)</label>
                <div className={inputGroupStyle}>
                    <FileText className={iconStyle} />
                    <input
                        type="text"
                        value={formData.content || ''}
                        onChange={(e) => handleChange('content', e.target.value)}
                        className={inputStyle}
                        placeholder="Hidden details..."
                    />
                </div>
           </div>
      </div>
  );

  const renderTextEditor = () => (
      <div className="space-y-5">
           <div>
                <label className={labelStyle}>Header Title</label>
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

           <div>
                <label className={labelStyle}>Content</label>
                <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className={`${textareaStyle} !h-48 text-base`}
                    placeholder="Write something..."
                />
           </div>

            {/* Optional URL for text blocks */}
           <div>
                <label className={labelStyle}>Link "Read More" (Optional)</label>
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
      </div>
  );

  const getModalTitle = () => {
      switch (block.type) {
          case 'profile': return 'Edit Profile';
          case 'social': return 'Edit Social Link';
          case 'map': return 'Edit Location';
          case 'list': return 'Edit List';
          case 'image': return 'Edit Image';
          case 'text': return 'Edit Text Block';
          default: return 'Edit Block';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-[440px] glass-panel rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 bg-[#09090b]/90 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#09090b]/95 z-20 pb-4 border-b border-white/5 backdrop-blur-xl -mx-4 px-4 pt-2 -mt-2">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {getModalTitle()}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1">
            {block.type === 'profile' && renderProfileEditor()}
            {block.type === 'social' && renderSocialEditor()}
            {block.type === 'map' && renderMapEditor()}
            {block.type === 'list' && renderListEditor()}
            {block.type === 'image' && renderImageEditor()}
            {block.type === 'text' && renderTextEditor()}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 sticky bottom-0 bg-[#09090b]/95 -mb-4 pb-4 z-20 backdrop-blur-xl -mx-4 px-4">
          <button 
            onClick={onClose}
            className="px-6 py-3.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
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