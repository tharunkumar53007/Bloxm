
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BlockData } from '../types';
import { BlockRenderer } from './BlockRenderer';
import { X, Maximize2, Pencil, GripVertical, Scaling, Copy, CheckCircle2 } from 'lucide-react';

interface BentoItemProps {
  block: BlockData;
  isEditing: boolean;
  isSelected?: boolean; 
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onResize: (id: string) => void;
  onEditContent: (block: BlockData) => void;
  onMove: (dragId: string, hoverId: string) => void;
  onUpdate?: (id: string, updates: Partial<BlockData>) => void;
  onToggleSelect?: (id: string, isModifier: boolean) => void;
  onItemClick?: (block: BlockData) => void;
}

const getSizeClasses = (size: string): string => {
  if (!size) return 'col-span-1 md:col-span-1 row-span-1';
  const [w, h] = size.split('x').map(Number);
  const validW = isNaN(w) ? 1 : Math.min(Math.max(w, 1), 4); 
  const validH = isNaN(h) ? 1 : Math.max(h, 1); 

  const colClass = validW === 1 ? 'md:col-span-1' : validW === 2 ? 'md:col-span-2' : validW === 3 ? 'md:col-span-3' : 'md:col-span-4';
  const rowClass = `row-span-${validH}`;
  
  return `col-span-1 ${colClass} ${rowClass}`;
};

export const BentoItem: React.FC<BentoItemProps> = ({ 
  block, 
  isEditing, 
  isSelected,
  onRemove,
  onDuplicate, 
  onResize, 
  onEditContent,
  onMove,
  onUpdate,
  onToggleSelect,
  onItemClick
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [ghostSize, setGhostSize] = useState<{ w: number, h: number } | null>(null);
  const [previewGridSize, setPreviewGridSize] = useState<string | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  
  const sizeClass = getSizeClasses(block.size || '1x1');
  const [w, h] = (block.size || '1x1').split('x').map(Number);
  const rowSpanVal = isNaN(h) ? 1 : Math.max(h, 1);
  
  const Wrapper = (!isEditing && block.url) ? 'a' : 'div';
  const wrapperProps = (!isEditing && block.url) ? { href: block.url, target: "_blank", rel: "noopener noreferrer" } : {};

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditing || isResizing) return;
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditing || isResizing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditing || isResizing) return;
    e.preventDefault();
    setIsDragOver(false);
    const dragId = e.dataTransfer.getData('text/plain');
    if (dragId && dragId !== block.id) {
      onMove(dragId, block.id);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!onUpdate || !itemRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    
    const rect = itemRef.current.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;
    
    const [currentCols, currentRows] = (block.size || '1x1').split('x').map(Number);
    const GAP = 24; 
    
    const colUnit = Math.max(50, (startWidth - (currentCols - 1) * GAP) / currentCols);
    const rowUnit = 180; 

    setGhostSize({ w: startWidth, h: startHeight });
    setPreviewGridSize(block.size);

    let currentSnappedSize = block.size;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newPixelW = Math.max(colUnit / 2, startWidth + deltaX);
      const newPixelH = Math.max(rowUnit / 2, startHeight + deltaY);
      
      setGhostSize({ w: newPixelW, h: newPixelH });

      const rawCols = (newPixelW + GAP) / (colUnit + GAP);
      const maxCols = window.innerWidth < 768 ? 1 : 4;
      
      const snappedCols = Math.max(1, Math.min(maxCols, Math.round(rawCols)));
      const snappedRows = Math.max(1, Math.round((newPixelH + GAP) / (rowUnit + GAP)));

      const newSizeStr = `${snappedCols}x${snappedRows}`;
      
      if (newSizeStr !== currentSnappedSize) {
        currentSnappedSize = newSizeStr;
        setPreviewGridSize(newSizeStr);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setGhostSize(null);
      setPreviewGridSize(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (currentSnappedSize !== block.size) {
        onUpdate(block.id, { size: currentSnappedSize });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isEditing && onToggleSelect) {
        const isModifier = e.ctrlKey || e.metaKey;
        onToggleSelect(block.id, isModifier);
    }
  };

  const handleItemClick = (e: React.MouseEvent) => {
      if (isEditing) {
        e.preventDefault(); // Prevent link nav when editing
        return;
      }
      
      // If a custom item click handler exists (e.g. for previewing docs), use it
      if (onItemClick) {
          e.preventDefault();
          onItemClick(block);
      }
  };

  return (
    <Wrapper
      {...wrapperProps}
      onClick={handleItemClick}
      // @ts-ignore
      ref={itemRef}
      draggable={isEditing && !isResizing && !isSelected} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        ${sizeClass} 
        relative group
        smooth-item
        ${!isEditing ? 'hover:scale-[1.03] hover:-translate-y-1.5 cursor-pointer active:scale-[0.98]' : 'cursor-grab active:cursor-grabbing'}
        ${isDragOver ? 'scale-[0.95] opacity-50' : ''}
        ${isResizing ? 'z-50 !transition-none' : ''}
        block
        transform-gpu
      `}
      style={{ 
        gridRowEnd: `span ${rowSpanVal}`,
      }}
    >
      <div className={`
         w-full h-full rounded-[2rem] overflow-hidden
         glass-panel
         ${isEditing ? 'border-dashed border-2 border-zinc-500/50 !bg-zinc-900/40' : ''}
         ${isDragOver ? '!border-indigo-500 bg-indigo-500/20' : ''}
         ${isSelected ? '!border-emerald-500 border-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[0.98]' : ''}
         h-full
      `}>
        
        {/* Internal gloss reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40 pointer-events-none z-0" />
        
        <div className="relative z-10 h-full">
          <BlockRenderer block={block} />
        </div>

        {/* Selection Overlay */}
        {isEditing && isSelected && (
             <div className="absolute inset-0 z-30 bg-emerald-500/10 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
                 <div className="absolute top-4 left-4 bg-emerald-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-300">
                     <CheckCircle2 className="w-5 h-5" />
                 </div>
             </div>
        )}

        {isEditing && (
          <div 
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-300 
              ${isResizing ? 'opacity-0' : ''}
              ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} 
              `}
              onClick={handleOverlayClick}
          >
            {!isSelected && (
                <>
                    <div className="flex gap-2 scale-90 group-hover:scale-100 transition-all duration-300 flex-wrap justify-center max-w-[90%] delay-75">
                    <button 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEditContent(block); }}
                        className="p-3 rounded-full liquid-btn text-zinc-200 hover:text-white hover:bg-indigo-500/50"
                        title="Edit Content (Ctrl+Click to Select)"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onResize(block.id); }}
                        className="p-3 rounded-full liquid-btn text-zinc-200 hover:text-white hover:bg-blue-500/50"
                        title="Cycle Standard Sizes"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                    {onDuplicate && (
                        <button 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDuplicate(block.id); }}
                        className="p-3 rounded-full liquid-btn text-zinc-200 hover:text-white hover:bg-emerald-500/50"
                        title="Duplicate Block"
                        >
                        <Copy className="w-5 h-5" />
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(block.id); }}
                        className="p-3 rounded-full liquid-btn text-zinc-200 hover:text-white hover:bg-red-500/50"
                        title="Remove Block"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>
                    
                    <div className="absolute top-4 left-4 text-xs font-mono text-zinc-300 bg-black/60 px-3 py-1 rounded-full border border-white/10 pointer-events-none backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    {block.size}
                    </div>
                    <div className="absolute top-4 right-4 pointer-events-none opacity-50">
                    <GripVertical className="w-5 h-5 text-zinc-400" />
                    </div>

                    {onUpdate && (
                    <div 
                        className="absolute bottom-0 right-0 p-4 cursor-se-resize z-30 hover:text-white text-zinc-400 transition-all hover:scale-110 active:scale-90"
                        onMouseDown={handleResizeStart}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Scaling className="w-6 h-6 drop-shadow-lg" />
                    </div>
                    )}
                </>
            )}
          </div>
        )}
      </div>

      {isResizing && ghostSize && createPortal(
        <div 
          className="fixed pointer-events-none z-[9999] border-2 border-indigo-400 border-dashed rounded-[2rem] bg-indigo-500/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.4)] transition-none"
          style={{
             top: itemRef.current?.getBoundingClientRect()?.top ?? 0,
             left: itemRef.current?.getBoundingClientRect()?.left ?? 0,
             width: ghostSize.w,
             height: ghostSize.h
          }}
        >
           <div className="flex flex-col items-center gap-1 bg-black/80 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl animate-in zoom-in duration-200">
             <span className="text-indigo-200 font-mono text-xs">
                {Math.round(ghostSize.w)}px × {Math.round(ghostSize.h)}px
             </span>
             {previewGridSize && (
               <span className="text-white font-bold text-sm">
                 Grid: {previewGridSize}
               </span>
             )}
           </div>
        </div>,
        document.body
      )}
    </Wrapper>
  );
};
