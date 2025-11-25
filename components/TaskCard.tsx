import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Trash2, Clock, CheckCircle, Maximize2, Minimize2, List, Circle, Play, Calendar, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import BlockEditor from './BlockEditor';
import MiniCalendar from './MiniCalendar';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask, deleteTask, moveTask } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const [showAiMenu, setShowAiMenu] = useState(false);
  const aiMenuTimer = useRef<NodeJS.Timeout | null>(null);

  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleStatusChange = (newStatus: TaskStatus) => {
    moveTask(task.id, newStatus);
    setShowStatusMenu(false);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <Circle className="w-3.5 h-3.5" />;
      case TaskStatus.IN_PROGRESS:
        return <Play className="w-3.5 h-3.5 fill-current" />;
      case TaskStatus.DONE:
        return <CheckCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'border-slate-300 dark:border-slate-500 hover:border-indigo-400 text-slate-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-500 border-blue-500 text-white';
      case TaskStatus.DONE:
        return 'bg-emerald-500 border-emerald-500 text-white';
    }
  };

  const statusColors = {
    [TaskStatus.TODO]: 'bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30',
    [TaskStatus.DONE]: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20'
  };

  const handleAiMouseEnter = () => {
    if (aiMenuTimer.current) clearTimeout(aiMenuTimer.current);
    setShowAiMenu(true);
  };

  const handleAiMouseLeave = () => {
    aiMenuTimer.current = setTimeout(() => {
        setShowAiMenu(false);
    }, 150);
  };

  const handleBlocksChange = useCallback((newBlocks: any[]) => {
    updateTask(task.id, { contentBlocks: newBlocks });
  }, [task.id, updateTask]);

  return (
    <motion.div
      layout
      layoutId={task.id}
      draggable
      onDragStart={handleDragStart as any}
      className={`group relative backdrop-blur-sm border rounded-xl transition-all ${statusColors[task.status]} 
        ${isExpanded ? 'ring-2 ring-indigo-500/50 shadow-2xl z-30 overflow-visible' : 'hover:border-slate-300 dark:hover:border-slate-500/50 mb-3 overflow-visible hover:z-20 shadow-sm'}
      `}
      transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
    >
      {/* Header */}
      <motion.div layout="position" className="p-4" onClick={() => !isExpanded && setIsExpanded(true)}>
        <div className="flex items-start justify-between gap-3">
            {/* Status Button with Dropdown */}
            <div className="relative">
              <button 
                  onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${getStatusColor(task.status)}`}
              >
                  {getStatusIcon(task.status)}
              </button>

              {/* Status Dropdown */}
              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1">
                      <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">Status</div>
                      <button
                        onClick={() => handleStatusChange(TaskStatus.TODO)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <Circle className="w-4 h-4 text-slate-500" />
                        <span>To Do</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <Play className="w-4 h-4 text-blue-400 fill-current" />
                        <span>In Progress</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(TaskStatus.DONE)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Done</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                    autoFocus
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent font-medium text-slate-900 dark:text-white border-b border-indigo-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <motion.h3 
                    layout="position"
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className={`font-medium text-slate-900 dark:text-slate-200 leading-tight cursor-text truncate ${task.status === TaskStatus.DONE ? 'line-through text-slate-500' : ''}`}
                    >
                    {task.title}
                    </motion.h3>
                )}
                
                {!isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                        {task.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                            {tag}
                        </span>
                        ))}
                        
                        {/* Date Picker */}
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowDatePicker(!showDatePicker); }}
                                className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                    task.dueDate 
                                        ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                                }`}
                            >
                                <Calendar className="w-3 h-3" />
                                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date'}</span>
                            </button>
                            
                            <AnimatePresence>
                                {showDatePicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full right-0 z-50"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MiniCalendar 
                                            value={task.dueDate}
                                            onChange={(date) => updateTask(task.id, { dueDate: date })}
                                            onClose={() => setShowDatePicker(false)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Label Input */}
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowTagInput(!showTagInput); }}
                                className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <Tag className="w-3 h-3" />
                                <span>Label</span>
                            </button>
                            <AnimatePresence>
                                {showTagInput && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <input
                                            autoFocus
                                            placeholder="Type label..."
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newTag.trim()) {
                                                    updateTask(task.id, { tags: [...task.tags, newTag.trim()] });
                                                    setNewTag('');
                                                    setShowTagInput(false);
                                                }
                                            }}
                                            className="w-full text-xs px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                                        />
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {['Urgent', 'Work', 'Personal'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => {
                                                        updateTask(task.id, { tags: [...task.tags, t] });
                                                        setShowTagInput(false);
                                                    }}
                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                        className={`transition-opacity text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 p-1 ${showAiMenu || isExpanded ? 'opacity-100 z-99 overflow-y-visible' : 'opacity-100 group-hover:opacity-100'}`}
                    >
                        <Wand2 className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                        {showAiMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
                            >
                                <div className="absolute -top-2 left-0 w-full h-2 bg-transparent" />
                                
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                        AI Actions
                                    </div>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const newTitle = await import('../services/geminiService').then(m => m.enhanceTextWithGemini(task.title, 'PROFESSIONAL'));
                                            updateTask(task.id, { title: newTitle });
                                            setShowAiMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-200 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Wand2 className="w-3 h-3 text-purple-500 dark:text-purple-400" /> Professionalize Title
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
                                        className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-200 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <List className="w-3 h-3 text-blue-500 dark:text-blue-400" /> Break Down to Tasks
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="opacity-80 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
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
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20"
          >
            <div className="p-4 cursor-text relative" onClick={(e) => e.stopPropagation()}>
                <BlockEditor 
                    blocks={task.contentBlocks || []} 
                    onChange={handleBlocksChange} 
                />
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/50 p-3 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Created {new Date(task.createdAt).toLocaleDateString()}
                </div>
                <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
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