import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Block, BlockType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, GripVertical, CheckSquare, Type, List, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { enhanceTextWithGemini } from '../services/geminiService';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange, readOnly = false }) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  // Use ref to access latest blocks in callbacks without triggering re-renders of callbacks
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // If no blocks, ensure at least one paragraph exists
  useEffect(() => {
    if (blocks.length === 0 && !readOnly) {
      onChange([{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }]);
    }
  }, [blocks.length, onChange, readOnly]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    const currentBlocks = blocksRef.current;
    onChange(currentBlocks.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [onChange]);

  const addBlock = useCallback((afterId: string, type: BlockType = 'paragraph') => {
    const currentBlocks = blocksRef.current;
    const index = currentBlocks.findIndex(b => b.id === afterId);
    const newBlock: Block = { id: `b-${Date.now()}`, type, content: '' };
    const newBlocks = [...currentBlocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
    setTimeout(() => {
        const el = document.getElementById(`block-${newBlock.id}`);
        el?.focus();
    }, 10);
  }, [onChange]);

  const removeBlock = useCallback((id: string) => {
    const currentBlocks = blocksRef.current;
    if (currentBlocks.length <= 1) return; // Don't delete last block
    const index = currentBlocks.findIndex(b => b.id === id);
    const prevBlock = currentBlocks[index - 1];
    onChange(currentBlocks.filter(b => b.id !== id));
    if (prevBlock) {
        setTimeout(() => {
            const el = document.getElementById(`block-${prevBlock.id}`);
            el?.focus();
        }, 10);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, block: Block) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(block.id);
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      removeBlock(block.id);
    }
    if (e.key === '/') {
        setMenuOpenId(block.id);
    }
  }, [addBlock, removeBlock]);

  const handleAIEdit = useCallback(async (block: Block) => {
     setMenuOpenId(null);
     const newContent = await enhanceTextWithGemini(block.content, 'PROFESSIONAL');
     updateBlock(block.id, { content: newContent });
  }, [updateBlock]);

  const handleConvertTo = useCallback((blockId: string, type: BlockType) => {
      updateBlock(blockId, { type });
      setMenuOpenId(null);
      const el = document.getElementById(`block-${blockId}`);
      el?.focus();
  }, [updateBlock]);

  const closeMenu = useCallback(() => setMenuOpenId(null), []);

  return (
    <div className="space-y-1 w-full relative">
      {blocks.map(block => (
        <BlockItem 
            key={block.id} 
            block={block} 
            updateBlock={updateBlock} 
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            isMenuOpen={menuOpenId === block.id}
            closeMenu={closeMenu}
            onAIEdit={handleAIEdit}
            onConvertTo={handleConvertTo}
        />
      ))}
    </div>
  );
};

interface BlockItemProps {
  block: Block;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent, block: Block) => void;
  readOnly: boolean;
  isMenuOpen: boolean;
  closeMenu: () => void;
  onConvertTo: (blockId: string, type: BlockType) => void;
  onAIEdit: (block: Block) => void;
}

const BlockItem = memo(({ block, updateBlock, onKeyDown, readOnly, isMenuOpen, closeMenu, onConvertTo, onAIEdit }: BlockItemProps) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    }, [block.content, block.type]);

    const getStyles = () => {
        switch (block.type) {
            case 'h1': return 'text-3xl font-bold mt-4 mb-2 text-slate-900 dark:text-white';
            case 'h2': return 'text-2xl font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-200';
            case 'h3': return 'text-xl font-medium mt-2 text-slate-700 dark:text-slate-300';
            case 'bullet': return 'text-base text-slate-700 dark:text-slate-300 pl-2';
            case 'todo': return 'text-base text-slate-700 dark:text-slate-300';
            default: return 'text-base text-slate-600 dark:text-slate-400';
        }
    };

    return (
        <div className="group relative flex items-start -ml-6 pl-6 py-0.5">
            {/* Hover Drag Handle / Menu Trigger */}
            {!readOnly && (
                <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
                    <GripVertical className="w-4 h-4" />
                </div>
            )}

            {/* Block Decorators */}
            <div className="flex-shrink-0 mr-2 mt-1">
                {block.type === 'bullet' && <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2" />}
                {block.type === 'todo' && (
                    <button 
                        onClick={() => updateBlock(block.id, { checked: !block.checked })}
                        className={`w-4 h-4 rounded border ${block.checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-400 dark:border-slate-600 hover:border-slate-600 dark:hover:border-slate-400'} flex items-center justify-center transition-colors`}
                    >
                        {block.checked && <CheckSquare className="w-3 h-3" />}
                    </button>
                )}
            </div>

            <div className="flex-1 relative">
                <textarea
                    id={`block-${block.id}`}
                    ref={inputRef}
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    onKeyDown={(e) => onKeyDown(e, block)}
                    readOnly={readOnly}
                    rows={1}
                    placeholder={block.type === 'paragraph' ? "Type '/' for commands" : `Heading ${block.type.replace('h', '')}`}
                    className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden placeholder-slate-400 dark:placeholder-slate-600/50 ${getStyles()} ${block.checked ? 'line-through opacity-50' : ''}`}
                />

                {/* Slash Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 top-full z-50 w-64 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden mt-1"
                        >
                            <div className="p-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold uppercase">Basic Blocks</span>
                                <button onClick={closeMenu}><X className="w-3 h-3 text-slate-500" /></button>
                            </div>
                            <div className="p-1 max-h-60 overflow-y-auto">
                                <MenuOption icon={Type} label="Heading 1" onClick={() => onConvertTo(block.id, 'h1')} />
                                <MenuOption icon={Type} label="Heading 2" onClick={() => onConvertTo(block.id, 'h2')} />
                                <MenuOption icon={Type} label="Heading 3" onClick={() => onConvertTo(block.id, 'h3')} />
                                <MenuOption icon={List} label="Bullet List" onClick={() => onConvertTo(block.id, 'bullet')} />
                                <MenuOption icon={CheckSquare} label="To-do List" onClick={() => onConvertTo(block.id, 'todo')} />
                                <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                                <MenuOption icon={Sparkles} label="AI Rewrite" onClick={() => onAIEdit(block)} color="text-purple-500 dark:text-purple-400" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

const MenuOption = ({ icon: Icon, label, onClick, color = 'text-slate-600 dark:text-slate-300' }: any) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors text-left group">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`${color} group-hover:text-slate-900 dark:group-hover:text-white`}>{label}</span>
    </button>
);

export default BlockEditor;
