
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BentoItem } from './components/BentoItem';
import { EditToolbar } from './components/EditToolbar';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { AIGenerator } from './components/AIGenerator';
import { ThemeSelector } from './components/ThemeSelector';
import { BlockEditorModal } from './components/BlockEditorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { VaultSection } from './components/VaultSection';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { BlockData, BlockType, BlockSize, AuthState, ThemeConfig, VaultFolder } from './types';
import { LogOut, Loader2 } from 'lucide-react';
import { Logo } from './components/Logo';
import { auth, onAuthStateChanged, logout } from './services/firebase';

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
    if (data.startsWith('data:image')) {
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
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

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        targetId: 'tutorial-edit-btn',
        title: 'Welcome to Bloxm!',
        description: 'Start here to enter Edit Mode. This unlocks all customization tools for your grid.',
        position: 'top'
    },
    {
        targetId: 'tutorial-add-blocks',
        title: 'Add Blocks',
        description: 'Drag and drop social links, text, images, maps, or lists directly onto your grid.',
        position: 'top'
    },
    {
        targetId: 'tutorial-ai-btn',
        title: 'AI Magic',
        description: 'Feeling stuck? Describe your persona and let AI generate a complete layout for you instantly.',
        position: 'top'
    },
    {
        targetId: 'tutorial-first-block',
        title: 'Edit Content',
        description: 'Click the pencil icon on any block to modify content, or grab the handle to resize it.',
        position: 'right'
    },
    {
        targetId: 'tutorial-vault',
        title: 'Private Vault',
        description: 'Scroll down to access your Vault. Store password-protected notes, files, and links securely.',
        position: 'bottom'
    }
];

const App: React.FC = () => {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  // App State
  const [isEditing, setIsEditing] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null); 
  const [vaultOpenId, setVaultOpenId] = useState<string | null>(null);
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Selection & Deletion State
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null); // Single delete
  const [isBulkDelete, setIsBulkDelete] = useState(false); // Flag for bulk delete modal
  
  // Data State
  const [blocks, setBlocks] = useState<BlockData[]>(DEFAULT_BLOCKS);
  const [vaultFolders, setVaultFolders] = useState<VaultFolder[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.removeItem('bloxm_guest_mode');
        setAuthState({
          isAuthenticated: true,
          user: {
            username: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar: user.photoURL || undefined
          }
        });
        
        // Check tutorial status
        const tutorialDone = localStorage.getItem(`bloxm_tutorial_done_${user.uid}`);
        if (!tutorialDone) {
            // Small delay to ensure DOM is ready
            setTimeout(() => setShowTutorial(true), 1000);
        }

      } else {
        const isGuest = localStorage.getItem('bloxm_guest_mode') === 'true';
        if (isGuest) {
             setAuthState({
                isAuthenticated: true,
                user: {
                    username: 'Guest',
                    email: 'guest@bloxm.dev',
                    avatar: undefined
                }
             });
             // Guest tutorial check
             const tutorialDone = localStorage.getItem(`bloxm_tutorial_done_guest`);
             if (!tutorialDone) {
                 setTimeout(() => setShowTutorial(true), 1000);
             }
        } else {
             setAuthState(prev => prev.isAuthenticated && prev.user?.email === 'guest@bloxm.dev' ? prev : { isAuthenticated: false, user: null });
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tutorial Logic: Force edit mode for the tutorial duration
  useEffect(() => {
    if (showTutorial) {
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showTutorial]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    const userId = auth.currentUser?.uid || 'guest';
    localStorage.setItem(`bloxm_tutorial_done_${userId}`, 'true');
    // Keep edit mode on so they can start working
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setIsEditing(false); // Turn off edit mode if they skipped
    const userId = auth.currentUser?.uid || 'guest';
    localStorage.setItem(`bloxm_tutorial_done_${userId}`, 'true');
  };

  // Load Data on Auth Success
  useEffect(() => {
    if (authState.isAuthenticated && !isSharedMode) {
      try {
        const savedBlocks = localStorage.getItem(`bloxm_blocks_${authState.user?.email}`);
        const savedTheme = localStorage.getItem(`bloxm_theme_${authState.user?.email}`);
        const savedVault = localStorage.getItem(`bloxm_vault_${authState.user?.email}`);

        if (savedBlocks) setBlocks(JSON.parse(savedBlocks));
        else setBlocks(DEFAULT_BLOCKS);

        if (savedTheme) setTheme(JSON.parse(savedTheme));
        else setTheme(DEFAULT_THEME);

        if (savedVault) setVaultFolders(JSON.parse(savedVault));
        else setVaultFolders([]);

      } catch (e) {
        console.error("Failed to load user data", e);
      }
    }
  }, [authState.isAuthenticated, authState.user?.email, isSharedMode]);

  // Check for Shared URL on Mount (Same logic)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    const dataParam = params.get('data');
    if (shareParam) {
      try {
        let jsonString = '';
        if (shareParam.includes('bloxm/') && dataParam) {
            const base64 = decodeURIComponent(dataParam);
            jsonString = decodeURIComponent(atob(base64));
        } else {
            const raw = dataParam || shareParam; 
            try {
              const base64 = decodeURIComponent(raw);
              jsonString = decodeURIComponent(atob(base64));
            } catch (legacyError) { console.warn("Legacy parse failed", legacyError); }
        }
        if (jsonString) {
            const decoded = JSON.parse(jsonString);
            if (decoded.blocks && decoded.theme) {
              setBlocks(decoded.blocks);
              setTheme(decoded.theme);
              setVaultFolders(decoded.vaultFolders || []); 
              setIsSharedMode(true);
              setAuthState({ isAuthenticated: true, user: decoded.user || { username: 'Guest', email: '' } });
              setAuthLoading(false);
            }
        }
      } catch (error) { console.error("Failed to parse shared data", error); }
    }
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (authState.isAuthenticated && !isSharedMode && authState.user?.email) {
      try {
        localStorage.setItem(`bloxm_blocks_${authState.user.email}`, JSON.stringify(blocks));
        localStorage.setItem(`bloxm_theme_${authState.user.email}`, JSON.stringify(theme));
        localStorage.setItem(`bloxm_vault_${authState.user.email}`, JSON.stringify(vaultFolders));
      } catch (e) { console.warn("Storage Quota Exceeded.", e); }
    }
  }, [blocks, theme, vaultFolders, authState.isAuthenticated, authState.user?.email, isSharedMode]);

  useEffect(() => { if (!isEditing) setSelectedBlockIds([]); }, [isEditing]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('bloxm_guest_mode'); 
    setAuthState({ isAuthenticated: false, user: null }); 
    setShowAuthScreen(false);
    setIsEditing(false);
    setIsSharedMode(false);
    setIsLogoutConfirmOpen(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleRemix = () => {
    setIsSharedMode(false);
    window.history.replaceState({}, '', window.location.pathname);
    window.location.reload(); 
  };
  
  const handleOfflineGuestLogin = () => {
      localStorage.setItem('bloxm_guest_mode', 'true'); 
      setAuthState({ isAuthenticated: true, user: { username: 'Guest', email: 'guest@bloxm.dev', avatar: undefined } });
  };

  const handleShare = async () => {
    const publicFolders = vaultFolders.filter(f => f.type === 'public');
    const payload = { blocks, theme, vaultFolders: publicFolders, user: authState.user };
    const sanitizedPayload = sanitizeForShare(payload);
    const hasLocallyUploadedImages = JSON.stringify(payload).length !== JSON.stringify(sanitizedPayload).length;

    try {
      const jsonString = JSON.stringify(sanitizedPayload);
      const uriEncoded = encodeURIComponent(jsonString);
      const base64 = btoa(uriEncoded);
      const finalData = encodeURIComponent(base64);
      const shareId = Math.random().toString(36).substr(2, 5);
      const username = authState.user?.username || 'user';
      const shareSlug = `bloxm/${username}+${shareId}`;
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}?share=${shareSlug}&data=${finalData}`;
      await navigator.clipboard.writeText(url);
      if (hasLocallyUploadedImages) alert("Link copied! Note: Local images were replaced with placeholders to keep the link valid.");
      else alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to generate share link", err);
      alert("Failed to generate link. Layout too complex.");
    }
  };

  // --- Selection & Actions Logic ---
  const handleBlockInteraction = (id: string, isModifierPressed: boolean) => {
    if (!isEditing) return;
    if (isModifierPressed || selectedBlockIds.length > 0) {
      setSelectedBlockIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      const block = blocks.find(b => b.id === id);
      if (block) setEditingBlock(block);
    }
  };

  const handleClearSelection = () => setSelectedBlockIds([]);
  const handleRemoveBlock = useCallback((id: string) => { setIsBulkDelete(false); setBlockToDelete(id); }, []);
  const handleBulkDeleteTrigger = () => { setIsBulkDelete(true); setBlockToDelete('BULK'); };
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

  const handleDuplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const blockToDuplicate = prev.find(b => b.id === id);
      if (!blockToDuplicate) return prev;
      const newBlock = { ...blockToDuplicate, id: Date.now().toString() + Math.random().toString(36).substr(2, 5), title: blockToDuplicate.title ? `${blockToDuplicate.title} (Copy)` : undefined, lastUpdated: Date.now() };
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
           const newBlock = { ...block, id: Date.now().toString() + Math.random().toString(36).substr(2, 5), title: block.title ? `${block.title} (Copy)` : undefined, lastUpdated: Date.now() };
           newBlocks.push(newBlock);
        }
      });
      return newBlocks;
    });
    setSelectedBlockIds([]); 
  };

  const handleResizeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== id) return block;
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
      size: type === 'list' ? '1x2' : '1x1',
      title: type === 'list' ? 'My List' : type.charAt(0).toUpperCase() + type.slice(1),
      content: type === 'text' ? 'Edit this content...' : undefined,
      imageUrl: type === 'image' || type === 'profile' ? `https://picsum.photos/seed/${Date.now()}/400/400` : undefined,
      iconName: type === 'social' ? 'globe' : undefined,
      listType: type === 'list' ? 'unordered' : undefined,
      items: type === 'list' ? ['Item 1', 'Item 2', 'Item 3'] : undefined,
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

  const handleAIGeneratedBlocks = (newBlocks: BlockData[], mode: 'replace' | 'append') => {
    const blocksWithTime = newBlocks.map(b => ({ ...b, lastUpdated: Date.now() }));
    if (mode === 'replace') { setBlocks(blocksWithTime); } 
    else { setBlocks(prev => [...prev, ...blocksWithTime]); }
    setIsEditing(false); 
  };

  const getBackgroundStyle = () => {
    if (theme.type === 'image') return { backgroundImage: `url(${theme.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    return { background: theme.value };
  };

  const blobColors = useMemo(() => {
    const val = theme.value.toLowerCase();
    if (val.includes('#450a0a') || val.includes('red') || val.includes('#831843')) return ['bg-red-600/20', 'bg-rose-600/15', 'bg-orange-500/10'];
    if (val.includes('#2e1065') || val.includes('purple') || val.includes('violet') || val.includes('#4c1d95')) return ['bg-violet-600/20', 'bg-fuchsia-600/15', 'bg-purple-500/10'];
    if (val.includes('#1e3a8a') || val.includes('blue')) return ['bg-blue-600/20', 'bg-cyan-600/15', 'bg-sky-500/10'];
    if (val.includes('#0f766e')) return ['bg-teal-600/20', 'bg-cyan-500/15', 'bg-emerald-500/10'];
    if (val.includes('#422006') || val.includes('gold')) return ['bg-yellow-600/10', 'bg-amber-600/15', 'bg-orange-500/10'];
    if (val.includes('#ec4899')) return ['bg-pink-500/20', 'bg-cyan-400/15', 'bg-purple-400/10'];
    if (val.includes('#27272a') || val.includes('#1f2937')) return ['bg-zinc-500/20', 'bg-slate-500/15', 'bg-gray-400/10'];
    return ['bg-emerald-600/20', 'bg-teal-600/15', 'bg-cyan-500/10'];
  }, [theme.value]);

  if (authLoading) {
      return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      );
  }

  // --- Landing Page Logic ---
  if (!authState.isAuthenticated) {
     if (showAuthScreen) {
        return <AuthScreen onBypassLogin={handleOfflineGuestLogin} onBack={() => setShowAuthScreen(false)} />;
     }
     return <LandingPage onGetStarted={() => setShowAuthScreen(true)} onLogin={() => setShowAuthScreen(true)} />;
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

      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end relative z-10" id="header-area">
        <div>
          <h2 className="text-white/60 font-medium tracking-widest text-xs uppercase mb-3 flex items-center gap-2 backdrop-blur-sm py-1 px-2 rounded-full bg-white/5 w-max border border-white/5">
             <span className={`w-2 h-2 rounded-full ${isSharedMode ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'} inline-block`}></span>
             {authState.user?.username}'s Hub {isSharedMode && '(Shared)'}
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
              <button onClick={handleRemix} className="text-xs text-emerald-300 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-white/5">Create Your Own</button>
            )}
            {isEditing && (
              <div className="text-sm text-emerald-200 animate-pulse border border-emerald-500/30 px-4 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                {selectedBlockIds.length > 0 ? `${selectedBlockIds.length} Selected` : 'Editing Active'}
              </div>
            )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-6 pb-20" id="bento-grid-area">
          {blocks.map((block, index) => (
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
              index={index}
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

      {/* Tutorial Overlay */}
      <TutorialOverlay 
         isOpen={showTutorial}
         steps={TUTORIAL_STEPS}
         onComplete={handleTutorialComplete}
         onSkip={handleTutorialSkip}
      />

      <AIGenerator isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onGenerated={handleAIGeneratedBlocks} currentTheme={theme} />
      <ThemeSelector isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} onSelect={setTheme} currentTheme={theme} />
      <BlockEditorModal isOpen={!!editingBlock} block={editingBlock} onClose={() => setEditingBlock(null)} onSave={handleUpdateBlock} />
      <DeleteConfirmModal isOpen={!!blockToDelete} onClose={() => { setBlockToDelete(null); setIsBulkDelete(false); }} onConfirm={handleConfirmDelete} count={isBulkDelete ? selectedBlockIds.length : 1} />
      <LogoutConfirmModal isOpen={isLogoutConfirmOpen} onClose={() => setIsLogoutConfirmOpen(false)} onConfirm={handleLogout} />
    </div>
  );
};

export default App;
