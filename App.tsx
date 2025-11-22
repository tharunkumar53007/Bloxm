
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BentoItem } from './components/BentoItem';
import { EditToolbar } from './components/EditToolbar';
import { AuthScreen } from './components/AuthScreen';
import { AIGenerator } from './components/AIGenerator';
import { ThemeSelector } from './components/ThemeSelector';
import { BlockEditorModal } from './components/BlockEditorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { VaultSection } from './components/VaultSection';
import { BlockData, BlockType, BlockSize, AuthState, ThemeConfig, VaultFolder } from './types';
import { LogOut } from 'lucide-react';
import { Logo } from './components/Logo';

// Initial Default Data (Fallback)
const DEFAULT_BLOCKS: BlockData[] = [
  {
    id: '1',
    type: 'profile',
    size: '2x2',
    title: 'Welcome',
    content: 'I am a creative developer based in Internet. This is my personal slice of the web.',
    status: 'Available for work',
    lastUpdated: Date.now()
  },
  {
    id: '2',
    type: 'social',
    size: '1x1',
    title: 'Twitter',
    iconName: 'twitter',
    url: 'https://twitter.com',
    lastUpdated: Date.now()
  },
  {
    id: '3',
    type: 'text',
    size: '2x1',
    title: 'Currently',
    content: 'Building the future of personal websites with AI and React.',
    lastUpdated: Date.now()
  }
];

// Default to Aesthetic Green
const DEFAULT_THEME: ThemeConfig = {
  type: 'gradient',
  value: 'linear-gradient(to bottom right, #022c22, #064e3b, #0f172a)'
};

// Helper to recursively remove large data:image strings to keep URL short
const sanitizeForShare = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // If string is a Base64 Image (starts with data:image), replace it
    if (data.startsWith('data:image')) {
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'; // Aesthetic abstract placeholder
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForShare);
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const key in data) {
      cleaned[key] = sanitizeForShare(data[key]);
    }
    return cleaned;
  }
  
  return data;
};

const App: React.FC = () => {
  // Auth State
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const savedUser = localStorage.getItem('bloxm_user');
      return savedUser 
        ? { isAuthenticated: true, user: JSON.parse(savedUser) }
        : { isAuthenticated: false, user: null };
    } catch (e) {
      console.error("Failed to parse user data", e);
      return { isAuthenticated: false, user: null };
    }
  });

  // App State
  const [isEditing, setIsEditing] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null); 
  const [vaultOpenId, setVaultOpenId] = useState<string | null>(null);
  
  // Selection & Deletion State
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null); // Single delete
  const [isBulkDelete, setIsBulkDelete] = useState(false); // Flag for bulk delete modal
  
  // Data State
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    try {
      const savedBlocks = localStorage.getItem('bloxm_blocks');
      return savedBlocks ? JSON.parse(savedBlocks) : DEFAULT_BLOCKS;
    } catch (e) {
      console.error("Failed to parse blocks", e);
      return DEFAULT_BLOCKS;
    }
  });

  const [vaultFolders, setVaultFolders] = useState<VaultFolder[]>(() => {
    try {
        const savedVault = localStorage.getItem('bloxm_vault');
        return savedVault ? JSON.parse(savedVault) : [];
    } catch (e) {
        return [];
    }
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const savedTheme = localStorage.getItem('bloxm_theme');
      return savedTheme ? JSON.parse(savedTheme) : DEFAULT_THEME;
    } catch (e) {
      console.error("Failed to parse theme", e);
      return DEFAULT_THEME;
    }
  });

  // Check for Shared URL on Mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    const dataParam = params.get('data');
    
    if (shareParam) {
      try {
        let jsonString = '';

        // New Format Logic: ?share=bloxm/user+id&data=...
        if (shareParam.includes('bloxm/') && dataParam) {
            // The payload is in the 'data' param
            const base64 = decodeURIComponent(dataParam);
            jsonString = decodeURIComponent(atob(base64));
        } else {
            // Legacy support: Payload was directly in 'share'
            // Attempt to decode as if it's the old format
            const raw = dataParam || shareParam; // Fallback
            try {
              const base64 = decodeURIComponent(raw);
              jsonString = decodeURIComponent(atob(base64));
            } catch (legacyError) {
               console.warn("Legacy parse failed", legacyError);
            }
        }
        
        if (jsonString) {
            const decoded = JSON.parse(jsonString);
            if (decoded.blocks && decoded.theme) {
              setBlocks(decoded.blocks);
              setTheme(decoded.theme);
              setVaultFolders(decoded.vaultFolders || []); 
              setIsSharedMode(true);
              setAuth({
                isAuthenticated: true,
                user: decoded.user || { username: 'Guest', email: '' }
              });
            }
        }
      } catch (error) {
        console.error("Failed to parse shared data", error);
        // alert("The shared link is invalid or corrupted.");
      }
    }
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (auth.isAuthenticated && !isSharedMode) {
      localStorage.setItem('bloxm_blocks', JSON.stringify(blocks));
      localStorage.setItem('bloxm_theme', JSON.stringify(theme));
      localStorage.setItem('bloxm_vault', JSON.stringify(vaultFolders));
    }
  }, [blocks, theme, vaultFolders, auth.isAuthenticated, isSharedMode]);

  // Clear selection when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setSelectedBlockIds([]);
    }
  }, [isEditing]);

  const handleLogin = (email: string) => {
    const user = { username: email.split('@')[0], email };
    localStorage.setItem('bloxm_user', JSON.stringify(user));
    setAuth({ isAuthenticated: true, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('bloxm_user');
    setAuth({ isAuthenticated: false, user: null });
    setIsEditing(false);
    setIsSharedMode(false);
    setIsLogoutConfirmOpen(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleRemix = () => {
    setIsSharedMode(false);
    window.history.replaceState({}, '', window.location.pathname);
    const localUser = localStorage.getItem('bloxm_user');
    if (!localUser) {
      setAuth({ isAuthenticated: false, user: null });
    } else {
      setAuth({ isAuthenticated: true, user: JSON.parse(localUser) });
    }
  };

  const handleShare = async () => {
    // Only share public folders
    const publicFolders = vaultFolders.filter(f => f.type === 'public');
    
    const payload = {
      blocks,
      theme,
      vaultFolders: publicFolders,
      user: auth.user
    };

    // SANITIZE: Remove massive data:image strings to prevent URL overflow
    const sanitizedPayload = sanitizeForShare(payload);
    const hasLocallyUploadedImages = JSON.stringify(payload).length !== JSON.stringify(sanitizedPayload).length;

    try {
      // 1. Stringify & Compress
      const jsonString = JSON.stringify(sanitizedPayload);
      const uriEncoded = encodeURIComponent(jsonString);
      const base64 = btoa(uriEncoded);
      const finalData = encodeURIComponent(base64);
      
      // 2. Generate Visual ID structure
      const shareId = Math.random().toString(36).substr(2, 5);
      const username = auth.user?.username || 'user';
      const shareSlug = `bloxm/${username}+${shareId}`;
      
      const baseUrl = window.location.origin + window.location.pathname;
      
      // 3. Construct URL: ?share=bloxm/name+id & data=...
      const url = `${baseUrl}?share=${shareSlug}&data=${finalData}`;
      
      await navigator.clipboard.writeText(url);

      if (hasLocallyUploadedImages) {
        alert("Link copied! Note: Local images were replaced with placeholders to keep the link valid.");
      } else {
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to generate share link", err);
      alert("Failed to generate link. Layout too complex.");
    }
  };

  // --- Selection Logic ---
  const handleBlockInteraction = (id: string, isModifierPressed: boolean) => {
    if (!isEditing) return;

    if (isModifierPressed || selectedBlockIds.length > 0) {
      // Toggle selection
      setSelectedBlockIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(i => i !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      // Open Editor
      const block = blocks.find(b => b.id === id);
      if (block) setEditingBlock(block);
    }
  };

  const handleClearSelection = () => {
    setSelectedBlockIds([]);
  };

  // --- Deletion Logic ---

  const handleRemoveBlock = useCallback((id: string) => {
    setIsBulkDelete(false);
    setBlockToDelete(id);
  }, []);

  const handleBulkDeleteTrigger = () => {
    setIsBulkDelete(true);
    setBlockToDelete('BULK'); // Dummy value to open modal
  };

  const handleConfirmDelete = useCallback(() => {
    if (isBulkDelete) {
      setBlocks(prev => prev.filter(b => !selectedBlockIds.includes(b.id)));
      setSelectedBlockIds([]);
      setIsBulkDelete(false);
      setBlockToDelete(null);
    } else if (blockToDelete) {
      setBlocks(prev => prev.filter(b => b.id !== blockToDelete));
      setBlockToDelete(null);
    }
  }, [blockToDelete, isBulkDelete, selectedBlockIds]);

  // --- Duplication Logic ---

  const handleDuplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const blockToDuplicate = prev.find(b => b.id === id);
      if (!blockToDuplicate) return prev;
      
      const newBlock = {
        ...blockToDuplicate,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: blockToDuplicate.title ? `${blockToDuplicate.title} (Copy)` : undefined,
        lastUpdated: Date.now()
      };
      
      // Insert after the original block
      const index = prev.indexOf(blockToDuplicate);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
  }, []);

  const handleBulkDuplicate = () => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      selectedBlockIds.forEach(id => {
        const block = prev.find(b => b.id === id);
        if (block) {
           const newBlock = {
            ...block,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            title: block.title ? `${block.title} (Copy)` : undefined,
            lastUpdated: Date.now()
          };
          // Just append for bulk
          newBlocks.push(newBlock);
        }
      });
      return newBlocks;
    });
    setSelectedBlockIds([]); // Clear selection after action
  };

  // --- Other Handlers ---

  const handleResizeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== id) return block;
      // Cycle standard sizes logic remains for the quick button
      const sizes = ['1x1', '2x1', '2x2', '1x2'];
      const currentIndex = sizes.indexOf(block.size);
      const nextSize = currentIndex !== -1 ? sizes[(currentIndex + 1) % sizes.length] : '1x1';
      return { ...block, size: nextSize };
    }));
  }, []);

  const handleUpdateBlock = useCallback((updatedBlock: BlockData) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? { ...updatedBlock, lastUpdated: Date.now() } : b));
  }, []);

  const handlePartialUpdate = useCallback((id: string, updates: Partial<BlockData>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: BlockData = {
      id: Date.now().toString(),
      type,
      size: '1x1',
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: type === 'text' ? 'Edit this content...' : undefined,
      imageUrl: type === 'image' || type === 'profile' ? `https://picsum.photos/seed/${Date.now()}/400/400` : undefined,
      iconName: type === 'social' ? 'globe' : undefined,
      lastUpdated: Date.now()
    };
    setBlocks(prev => [...prev, newBlock]);
  }, []);

  const handleMoveBlock = useCallback((dragId: string, hoverId: string) => {
    setBlocks(prev => {
      const dragIndex = prev.findIndex(b => b.id === dragId);
      const hoverIndex = prev.findIndex(b => b.id === hoverId);
      if (dragIndex < 0 || hoverIndex < 0 || dragIndex === hoverIndex) return prev;
      const newBlocks = [...prev];
      const [draggedItem] = newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedItem);
      return newBlocks;
    });
  }, []);

  const handleAIGeneratedBlocks = (newBlocks: BlockData[]) => {
    const blocksWithTime = newBlocks.map(b => ({ ...b, lastUpdated: Date.now() }));
    setBlocks(blocksWithTime);
    setIsEditing(false); 
  };

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

  // Memoize blob colors to prevent recalculation on every render
  const blobColors = useMemo(() => {
    const val = theme.value.toLowerCase();
    // Red/Crimson/Rose
    if (val.includes('#450a0a') || val.includes('red') || val.includes('#831843')) {
        return ['bg-red-600/20', 'bg-rose-600/15', 'bg-orange-500/10'];
    }
    // Purple/Amethyst/Violet
    if (val.includes('#2e1065') || val.includes('purple') || val.includes('violet') || val.includes('#4c1d95')) {
        return ['bg-violet-600/20', 'bg-fuchsia-600/15', 'bg-purple-500/10'];
    }
    // Blue/Ocean
    if (val.includes('#1e3a8a') || val.includes('blue')) {
        return ['bg-blue-600/20', 'bg-cyan-600/15', 'bg-sky-500/10'];
    }
    // Teal/Northern Lights
    if (val.includes('#0f766e')) {
        return ['bg-teal-600/20', 'bg-cyan-500/15', 'bg-emerald-500/10'];
    }
    // Gold
    if (val.includes('#422006') || val.includes('gold')) {
        return ['bg-yellow-600/10', 'bg-amber-600/15', 'bg-orange-500/10'];
    }
    // Cotton Candy
    if (val.includes('#ec4899')) {
        return ['bg-pink-500/20', 'bg-cyan-400/15', 'bg-purple-400/10'];
    }
    // Obsidian/Titanium (Monochrome)
    if (val.includes('#27272a') || val.includes('#1f2937')) {
        return ['bg-zinc-500/20', 'bg-slate-500/15', 'bg-gray-400/10'];
    }
    // Default Aesthetic Green
    return ['bg-emerald-600/20', 'bg-teal-600/15', 'bg-cyan-500/10'];
  }, [theme.value]);

  if (!auth.isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div 
      className="min-h-screen pb-32 px-4 md:px-8 pt-8 md:pt-16 selection:bg-emerald-500/30 selection:text-emerald-100 relative transition-all duration-700 ease-in-out overflow-hidden"
      style={getBackgroundStyle()}
    >
      {/* Overlay for Image Themes */}
      {theme.type === 'image' && (
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-0 backdrop-blur-[4px]" />
      )}

      {/* Ambient Liquid Blobs - Optimized with will-change */}
      {theme.type !== 'image' && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-1000 transform-gpu">
           <div className={`absolute top-0 left-1/4 w-[50vw] h-[50vw] ${blobColors[0]} rounded-full blur-[100px] animate-float mix-blend-screen will-change-transform`} />
           <div className={`absolute bottom-0 right-1/4 w-[45vw] h-[45vw] ${blobColors[1]} rounded-full blur-[80px] animate-float-delayed mix-blend-screen will-change-transform`} />
           <div className={`absolute top-1/3 right-1/3 w-[30vw] h-[30vw] ${blobColors[2]} rounded-full blur-[60px] animate-pulse mix-blend-screen will-change-transform`} />
        </div>
      )}

      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end relative z-10">
        <div>
          <h2 className="text-white/60 font-medium tracking-widest text-xs uppercase mb-3 flex items-center gap-2 backdrop-blur-sm py-1 px-2 rounded-full bg-white/5 w-max border border-white/5">
             <span className={`w-2 h-2 rounded-full ${isSharedMode ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'} inline-block`}></span>
             {auth.user?.username}'s Hub {isSharedMode && '(Shared)'}
          </h2>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl md:text-6xl text-white drop-shadow-xl text-glow" style={{ fontFamily: "'Grand Hotel', cursive" }}>Bloxm</h1>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            {!isSharedMode && (
              <button 
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-3 rounded-full liquid-btn text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            {isSharedMode && (
              <button 
                onClick={handleRemix}
                className="text-xs text-emerald-300 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-white/5"
              >
                Create Your Own
              </button>
            )}
            {isEditing && (
              <div className="text-sm text-emerald-200 animate-pulse border border-emerald-500/30 px-4 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                {selectedBlockIds.length > 0 ? `${selectedBlockIds.length} Selected` : 'Editing Active'}
              </div>
            )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-6 pb-20">
          {blocks.map(block => (
            <BentoItem 
              key={block.id} 
              block={block} 
              isEditing={isEditing}
              isSelected={selectedBlockIds.includes(block.id)}
              onRemove={handleRemoveBlock}
              onDuplicate={handleDuplicateBlock}
              onResize={handleResizeBlock}
              onEditContent={(b) => setEditingBlock(b)}
              onMove={handleMoveBlock}
              onUpdate={handlePartialUpdate}
              onToggleSelect={handleBlockInteraction}
            />
          ))}
        </div>

        {/* Vault Section */}
        <VaultSection 
           folders={vaultFolders} 
           isEditing={isEditing} 
           onUpdateFolders={setVaultFolders}
           theme={theme}
           isSharedMode={isSharedMode}
           openFolderId={vaultOpenId}
           onOpenFolder={setVaultOpenId}
        />
      </main>

      {/* Only show EditToolbar when vault is CLOSED */}
      {!vaultOpenId && (
        <EditToolbar 
          isEditing={isEditing} 
          toggleEdit={() => setIsEditing(!isEditing)} 
          addBlock={handleAddBlock}
          onOpenAI={() => setIsAIModalOpen(true)}
          onOpenTheme={() => setIsThemeModalOpen(true)}
          onShare={handleShare}
          isSharedMode={isSharedMode}
          onRemix={handleRemix}
          selectedCount={selectedBlockIds.length}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDeleteTrigger}
          onBulkDuplicate={handleBulkDuplicate}
        />
      )}

      <AIGenerator 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        onGenerated={handleAIGeneratedBlocks}
        currentTheme={theme}
      />

      <ThemeSelector 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)}
        onSelect={setTheme}
        currentTheme={theme}
      />

      <BlockEditorModal
        isOpen={!!editingBlock}
        block={editingBlock}
        onClose={() => setEditingBlock(null)}
        onSave={handleUpdateBlock}
      />

      <DeleteConfirmModal 
        isOpen={!!blockToDelete}
        onClose={() => { setBlockToDelete(null); setIsBulkDelete(false); }}
        onConfirm={handleConfirmDelete}
        count={isBulkDelete ? selectedBlockIds.length : 1}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default App;
