
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Folder, Lock, Unlock, Plus, X, Shield, FolderOpen, Settings, Trash2, Save, ArrowRight, Video, Globe, StickyNote, Link as LinkIcon, Tag, Loader2, SquarePen, Check, Search, CheckCircle2, Type, Image as ImageIcon, Upload, FileText, Download, Share2, ExternalLink } from 'lucide-react';
import { BlockData, VaultFolder, BlockType, ThemeConfig } from '../types';
import { BentoItem } from './BentoItem';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface VaultSectionProps {
  folders: VaultFolder[];
  isEditing: boolean;
  onUpdateFolders: (folders: VaultFolder[]) => void;
  theme: ThemeConfig;
  isSharedMode?: boolean;
  openFolderId: string | null;
  onOpenFolder: (id: string | null) => void;
}

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

  // Folder Deletion State
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const activeFolder = folders?.find(f => f && f.id === openFolderId);

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
    setFolderModal({
      isOpen: true,
      mode: 'create',
      data: { type: 'public', name: '', password: '' }
    });
  };

  const handleOpenEdit = (folder: VaultFolder) => {
    setFolderModal({
      isOpen: true,
      mode: 'edit',
      folderId: folder.id,
      data: { ...folder }
    });
  };

  const handleSaveFolder = () => {
    const { mode, data, folderId } = folderModal;
    if (!data.name) return;

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
      if (block.tags?.includes('document')) {
          setPreviewDocument(block);
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
  }, [activeFolder, searchQuery]); // Dep: activeFolder covers activeFolder.items

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
                    <input 
                        type="text" // Visible text for easier setting
                        value={folderModal.data.password || ''}
                        onChange={e => setFolderModal(prev => ({ ...prev, data: { ...prev.data, password: e.target.value } }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-red-500/50 focus:outline-none mt-1"
                        placeholder="Required for access"
                    />
                 </div>
               )}

               <button 
                  onClick={handleSaveFolder}
                  disabled={!folderModal.data.name || (folderModal.data.type === 'private' && !folderModal.data.password)}
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
           <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
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
                                <p>This folder is empty. {isSharedMode ? '' : 'Add items using the button above.'}</p>
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
           />
           
           {/* Replaced generic BlockEditorModal with Vault-specific one */}
           <VaultEditItemModal 
              isOpen={!!editingBlock}
              block={editingBlock}
              onClose={() => setEditingBlock(null)}
              onSave={handleUpdateBlock}
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
        </div>
      )}
    </div>
  );
};

// --- Internal Component: Document Preview Modal ---
interface DocumentPreviewModalProps {
    isOpen: boolean;
    block: BlockData | null;
    onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, block, onClose }) => {
    if (!isOpen || !block) return null;

    const isImage = block.type === 'image' || (block.url && (block.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || block.url.startsWith('data:image')));
    
    const handleDownload = () => {
        if (!block.url) return;
        const link = document.createElement('a');
        link.href = block.url;
        link.download = block.title || 'download';
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
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-4xl h-[80vh] flex flex-col glass-panel rounded-[2rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                    <div>
                        <h3 className="text-xl font-bold text-white line-clamp-1">{block.title}</h3>
                        <p className="text-zinc-400 text-xs">{block.content}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-6 h-6 text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* Content Preview */}
                <div className="flex-1 bg-black/40 flex items-center justify-center p-8 relative overflow-hidden">
                     {/* Checkerboard pattern for transparency */}
                     <div className="absolute inset-0 opacity-20" 
                        style={{ 
                            backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }} 
                     />

                     {isImage ? (
                         <img 
                            src={block.url || block.imageUrl} 
                            alt={block.title} 
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg relative z-10"
                         />
                     ) : (
                         <div className="flex flex-col items-center gap-4 relative z-10 text-zinc-400">
                             <FileText className="w-24 h-24 opacity-50" />
                             <p className="text-lg">Preview not available for this file type</p>
                         </div>
                     )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-center gap-4">
                     <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5"
                     >
                        <Download className="w-4 h-4" />
                        Download
                     </button>
                     <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border border-white/5"
                     >
                        <Share2 className="w-4 h-4" />
                        Share
                     </button>
                </div>
            </div>
        </div>
    );
};

// --- Internal Component: Vault Add Item Modal ---

interface VaultAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: BlockData) => void;
}

const VaultAddItemModal: React.FC<VaultAddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState<'video' | 'link' | 'note' | 'document'>('video');
  const [url, setUrl] = useState('');
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, type: string} | null>(null);

  // Auto-fetch metadata when URL changes
  useEffect(() => {
    if (!url || type === 'note' || type === 'document') {
        setIsFetching(false);
        return;
    }

    // Prevent overwriting if user has typed a custom title
    if (title.trim()) return;

    const controller = new AbortController();
    
    const debounceTimer = setTimeout(async () => {
       setIsFetching(true);
       let fetchedTitle = null;
       
       try {
          const targetUrl = url.toLowerCase();
          const isOembedProvider = targetUrl.includes('youtube.com') || 
                                   targetUrl.includes('youtu.be') || 
                                   targetUrl.includes('vimeo.com') || 
                                   targetUrl.includes('twitter.com') || 
                                   targetUrl.includes('x.com') ||
                                   targetUrl.includes('reddit.com');

          if (isOembedProvider) {
              try {
                  const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, { signal: controller.signal });
                  const data = await res.json();
                  if (data.title && !data.error) {
                      fetchedTitle = data.title;
                  }
              } catch (e) { /* ignore */ }
          }

          if (!fetchedTitle) {
              try {
                  const microRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, { signal: controller.signal });
                  const microData = await microRes.json();
                  
                  if (microData.status === 'success' && microData.data?.title) {
                      fetchedTitle = microData.data.title;
                  }
              } catch (e) { /* ignore */ }
          }
          
       } catch (err) {
          // AbortError or other
       } finally {
          if (!controller.signal.aborted) {
              if (fetchedTitle) {
                  setTitle(fetchedTitle);
              } else {
                  runHeuristic(url);
              }
              setIsFetching(false);
          }
       }
    }, 800); 

    return () => {
        clearTimeout(debounceTimer);
        controller.abort();
    };
  }, [url, type]); 

  const runHeuristic = (val: string) => {
     let fallback = 'Link Item';
     try {
         const lower = val.toLowerCase();
         
         if (lower.includes('youtube') || lower.includes('youtu.be')) fallback = 'YouTube Video';
         else if (lower.includes('vimeo')) fallback = 'Vimeo Video';
         else if (lower.includes('tiktok')) fallback = 'TikTok Post';
         else if (lower.includes('twitter') || lower.includes('x.com')) fallback = 'X Post';
         else if (lower.includes('instagram')) fallback = 'Instagram Post';
         else if (lower.includes('facebook')) fallback = 'Facebook Post';
         else if (lower.includes('linkedin')) fallback = 'LinkedIn Post';
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
            } catch (e) { /* ignore */ }
         }
     } catch(e) {
         // Fallback if something throws in string manipulation (unlikely for strings but safety first)
     }
     setTitle(fallback);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
         if (file.size > 5 * 1024 * 1024) {
            alert("File size limit is 5MB for local storage.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedFile({ name: file.name, data: reader.result as string, type: file.type });
            if (!title) setTitle(file.name);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const id = Date.now().toString();
    let block: BlockData;

    if (type === 'note') {
      block = {
        id,
        type: 'text',
        size: '2x1',
        title: title || 'Untitled Note',
        content: content || 'No content...',
        lastUpdated: Date.now()
      };
    } else {
      let icon = 'globe';
      let finalUrl = url;
      let blockImageUrl: string | undefined;
      let blockType: BlockType = 'social';

      if (type === 'document') {
          icon = 'file-text';
          finalUrl = uploadedFile ? uploadedFile.data : url;
          if (uploadedFile && uploadedFile.type.startsWith('image/')) {
              blockImageUrl = uploadedFile.data;
              blockType = 'image'; // Switch to 'image' type for full visibility
          }
      } else if (url.includes('youtube') || url.includes('youtu.be')) icon = 'youtube';
      else if (url.includes('vimeo')) icon = 'video';
      else if (url.includes('twitch')) icon = 'twitch';
      else if (url.includes('twitter') || url.includes('x.com')) icon = 'twitter';
      else if (url.includes('instagram')) icon = 'instagram';
      else if (url.includes('facebook')) icon = 'facebook';
      else if (url.includes('spotify')) icon = 'spotify';
      else if (type === 'video') icon = 'video';
      else if (type === 'link') icon = 'link';

      // Generate favicon URL for links/videos (not uploads)
      let faviconUrl;
      if (type !== 'document' || !uploadedFile) {
          try {
            if (finalUrl && !finalUrl.startsWith('data:')) {
                const hostname = new URL(finalUrl).hostname;
                faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
            }
          } catch(e) { /* ignore */ }
      }

      block = {
        id,
        type: blockType,
        size: '1x1',
        title: title || (type === 'document' ? 'Document' : 'Link'),
        url: finalUrl,
        imageUrl: blockImageUrl,
        iconName: icon,
        faviconUrl,
        tags: tag ? [tag] : (type === 'document' ? ['document'] : []),
        lastUpdated: Date.now(),
        content: blockType === 'image' ? (uploadedFile?.name || 'Image') : undefined
      };
    }

    onAdd(block);
    setUrl('');
    setTag('');
    setTitle('');
    setContent('');
    setUploadedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-panel rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-white">Add to Vault</h3>
           <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setType('video')} className={`flex-1 py-2 min-w-[80px] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${type === 'video' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Video className="w-4 h-4" /> Video
          </button>
          <button onClick={() => setType('link')} className={`flex-1 py-2 min-w-[80px] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${type === 'link' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Globe className="w-4 h-4" /> Link
          </button>
          <button onClick={() => setType('document')} className={`flex-1 py-2 min-w-[80px] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${type === 'document' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <FileText className="w-4 h-4" /> Doc
          </button>
          <button onClick={() => setType('note')} className={`flex-1 py-2 min-w-[80px] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${type === 'note' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <StickyNote className="w-4 h-4" /> Note
          </button>
        </div>

        <div className="space-y-4">
          {/* Document Upload Area */}
          {type === 'document' && (
             <div className="mb-4">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-2 block">Upload File</label>
                <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl bg-black/20 hover:bg-black/40 hover:border-emerald-500/30 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-6 h-6 mb-2 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                            <p className="text-xs text-zinc-500 group-hover:text-zinc-300 text-center px-2 break-all">
                                {uploadedFile ? uploadedFile.name : "Click to upload (PDF, Doc, etc)"}
                            </p>
                        </div>
                        <input type="file" className="hidden" onChange={handleDocumentUpload} />
                    </label>
                </div>
             </div>
          )}

          {type !== 'note' && (
            <div>
               <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-1 block">
                  {type === 'document' ? (uploadedFile ? 'Or Document URL (Ignored)' : 'Or Document URL') : 'URL Link'}
               </label>
               <div className="relative group">
                 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400" />
                 <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-emerald-500/50 focus:outline-none disabled:opacity-50"
                    placeholder={type === 'document' ? "https://example.com/file.pdf" : "https://..."}
                    disabled={type === 'document' && !!uploadedFile}
                    autoFocus={type !== 'document'}
                 />
               </div>
            </div>
          )}

          <div>
             <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-1 flex items-center justify-between">
                {type === 'note' ? 'Note Title' : 'Title'}
                {isFetching && <span className="flex items-center gap-1 text-emerald-400 normal-case"><Loader2 className="w-3 h-3 animate-spin" /> Fetching info...</span>}
             </label>
             <div className="relative">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none"
                    placeholder={type === 'note' ? "My Secret Note" : "Item Title"}
                />
             </div>
          </div>

          {type === 'video' && (
            <div>
               <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-1 block">Tag (For future search)</label>
               <div className="relative group">
                 <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400" />
                 <input 
                    type="text" 
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-emerald-500/50 focus:outline-none"
                    placeholder="e.g. inspiration, tutorial, music"
                 />
               </div>
            </div>
          )}

          {type === 'note' && (
            <div>
               <label className="text-xs font-bold text-zinc-500 uppercase ml-1 mb-1 block">Content</label>
               <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:outline-none resize-none"
                  placeholder="Type your note here..."
               />
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={type !== 'note' && !url && !uploadedFile}
            className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
          >
            Add Item
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Internal Component: Vault Edit Item Modal (Specific) ---

interface VaultEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBlock: BlockData) => void;
  block: BlockData | null;
}

const VaultEditItemModal: React.FC<VaultEditItemModalProps> = ({ isOpen, onClose, onSave, block }) => {
  const [formData, setFormData] = useState<Partial<BlockData>>({});
  const [tagInput, setTagInput] = useState('');
  const [showAppearance, setShowAppearance] = useState(false);

  useEffect(() => {
    if (block) {
      setFormData({ ...block });
      setTagInput(block.tags ? block.tags.join(', ') : '');
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const handleSave = () => {
     const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
     onSave({ ...block, ...formData, tags } as BlockData);
     onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isNote = block.type === 'text';
  const labelStyle = "block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest ml-1";
  const inputStyle = "w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500/50 focus:bg-black/40 focus:outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-panel rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 bg-[#09090b]/90">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
             Edit {isNote ? 'Note' : 'Item'}
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-zinc-400" /></button>
        </div>

        <div className="space-y-5">
          {/* Title - Always shown */}
          <div>
            <label className={labelStyle}>Title</label>
            <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400" />
                <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`${inputStyle} pl-11`}
                    placeholder="Item Title"
                />
            </div>
          </div>

          {/* URL - Only for non-notes */}
          {!isNote && (
            <div>
                <label className={labelStyle}>URL Link</label>
                <div className="relative group">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400" />
                    <input
                        type="url"
                        value={formData.url || ''}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        className={`${inputStyle} pl-11`}
                        placeholder="https://..."
                    />
                </div>
            </div>
          )}

          {/* Content - For Notes or description */}
          <div>
            <label className={labelStyle}>{isNote ? 'Note Content' : 'Description (Optional)'}</label>
            <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className={`${inputStyle} h-32 resize-none`}
                placeholder={isNote ? "Write your note..." : "Short description..."}
            />
          </div>

          {/* Tags - Specific fix for Vault */}
          <div>
            <label className={labelStyle}>Tags (Comma separated)</label>
            <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400" />
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className={`${inputStyle} pl-11`}
                    placeholder="design, important, todo..."
                />
            </div>
          </div>

          {/* Appearance Toggle */}
          <div className="pt-2">
              <button 
                onClick={() => setShowAppearance(!showAppearance)}
                className="text-xs font-bold text-zinc-500 flex items-center gap-1 hover:text-emerald-400 transition-colors"
              >
                {showAppearance ? 'Hide Appearance' : 'Show Appearance'}
              </button>
              
              {showAppearance && (
                  <div className="mt-3 animate-in slide-in-from-top-2">
                    <label className={labelStyle}>Custom Banner Image</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400" />
                            <input
                                type="text"
                                value={formData.imageUrl || ''}
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                className={`${inputStyle} pl-11 py-2 text-sm`}
                                placeholder="https://..."
                            />
                        </div>
                        <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl w-[46px] flex items-center justify-center transition-colors group">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <Upload className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                        </label>
                    </div>
                    {/* Image Preview Container */}
                    {formData.imageUrl && (
                        <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-white/10 group">
                           <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs text-white font-medium">Preview</p>
                           </div>
                        </div>
                    )}
                  </div>
              )}
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
