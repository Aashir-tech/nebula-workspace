import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react'; // Ensure you import from framer-motion
import { Wand2, Trash2, Clock, CheckCircle, Maximize2, Minimize2, List } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import BlockEditor from './BlockEditor';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask, deleteTask, moveTask } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  
  // Fix 1: State-based hover for stable dropdowns
  const [showAiMenu, setShowAiMenu] = useState(false);
  const aiMenuTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== task.title) {
      updateTask(task.id, { title: editedTitle });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const toggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveTask(task.id, task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE);
  };

  const statusColors = {
    [TaskStatus.TODO]: 'bg-slate-800/60 border-slate-700',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-900/20 border-blue-500/30',
    [TaskStatus.DONE]: 'bg-emerald-900/10 border-emerald-500/20'
  };

  // Logic to keep menu open for a moment to prevent flickering
  const handleAiMouseEnter = () => {
    if (aiMenuTimer.current) clearTimeout(aiMenuTimer.current);
    setShowAiMenu(true);
  };

  const handleAiMouseLeave = () => {
    aiMenuTimer.current = setTimeout(() => {
        setShowAiMenu(false);
    }, 150); // Small delay to allow mouse transition
  };

  return (
    <motion.div
      layout // Fix 3: Logic for auto-resizing height smoothly
      layoutId={task.id}
      draggable
      onDragStart={handleDragStart as any}
      // Fix 2: Remove overflow-hidden when expanded so Slash menus can pop out
      className={`group relative backdrop-blur-sm border rounded-xl transition-all ${statusColors[task.status]} 
        ${isExpanded ? 'ring-2 ring-indigo-500/50 shadow-2xl z-30 overflow-visible' : 'hover:border-slate-500/50 mb-3 overflow-visible hover:z-20'}
      `}
      transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
    >
      {/* Header */}
      <motion.div layout="position" className="p-4" onClick={() => !isExpanded && setIsExpanded(true)}>
        <div className="flex items-start justify-between gap-3">
            {/* Checkbox */}
            <button 
                onClick={toggleComplete}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${task.status === TaskStatus.DONE ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 hover:border-indigo-400'}`}
            >
                {task.status === TaskStatus.DONE && <CheckCircle className="w-3.5 h-3.5" />}
            </button>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                    autoFocus
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent font-medium text-white border-b border-indigo-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <motion.h3 
                    layout="position"
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className={`font-medium text-slate-200 leading-tight cursor-text truncate ${task.status === TaskStatus.DONE ? 'line-through text-slate-500' : ''}`}
                    >
                    {task.title}
                    </motion.h3>
                )}
                
                {!isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {task.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                            {tag}
                        </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                {/* AI Actions - Fixed Dropdown */}
                <div 
                    className="relative"
                    onMouseEnter={handleAiMouseEnter}
                    onMouseLeave={handleAiMouseLeave}
                >
                    <button 
                        onClick={(e) => e.stopPropagation()}
                        className={`transition-opacity text-slate-500 hover:text-purple-400 p-1 ${showAiMenu || isExpanded ? 'opacity-100 z-99 overflow-y-visible' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                        <Wand2 className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                        {showAiMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-56 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10"
                            >
                                {/* Invisible Bridge to prevent closing when moving mouse */}
                                <div className="absolute -top-2 left-0 w-full h-2 bg-transparent" />
                                
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                        AI Actions
                                    </div>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            // Add loading state logic here if needed
                                            const newTitle = await import('../services/geminiService').then(m => m.enhanceTextWithGemini(task.title, 'PROFESSIONAL'));
                                            updateTask(task.id, { title: newTitle });
                                            setShowAiMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-purple-500/20 hover:text-purple-200 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Wand2 className="w-3 h-3 text-purple-400" /> Professionalize Title
                                    </button>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const checklist = await import('../services/geminiService').then(m => m.enhanceTextWithGemini(task.title, 'BREAK_DOWN'));
                                            const newBlocks = checklist.split('\n').filter(l => l.trim()).map(l => ({
                                                id: `b-${Date.now()}-${Math.random()}`,
                                                type: 'todo' as const,
                                                content: l.replace(/^-\s*/, ''),
                                                checked: false
                                            }));
                                            updateTask(task.id, { contentBlocks: [...(task.contentBlocks || []), ...newBlocks] });
                                            setIsExpanded(true);
                                            setShowAiMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <List className="w-3 h-3 text-blue-400" /> Break Down to Tasks
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white p-1"
                >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
      </motion.div>

      {/* Expanded Content - The Block Editor */}
      <AnimatePresence mode="sync">
        {isExpanded && (
          <motion.div
            layout // Key for smooth height resizing
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 cursor-text relative" onClick={(e) => e.stopPropagation()}>
                {/* BlockEditor needs to ensure it doesn't have fixed height */}
                <BlockEditor 
                    blocks={task.contentBlocks || []} 
                    onChange={(newBlocks) => updateTask(task.id, { contentBlocks: newBlocks })} 
                />
            </div>

            <div className="bg-slate-900/50 p-3 flex items-center justify-between border-t border-white/5">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Created {new Date(task.createdAt).toLocaleDateString()}
                </div>
                <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;