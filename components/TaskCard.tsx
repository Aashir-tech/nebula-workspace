import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
    Clock, MoreVertical, Sparkles, ChevronDown, ChevronUp,
    Trash2, Maximize2, Minimize2, Play, Pause, RotateCcw,
    Edit, Calendar as CalendarIcon, MessageSquare, MoreHorizontal, ArrowRight, Copy, Archive,
    Wand2, CheckCircle, List, Circle, Tag, Mic,
    Flag, X, Check, UserCircle2, Users,
    Calendar, Bell, ChevronRight
} from 'lucide-react';
import TaskAssignmentSelector from './TaskAssignmentSelector';
import { workspaceAPI } from '../services/api';
import { useStore } from '../context/StoreContext';
import BlockEditor from './BlockEditor';
import MiniCalendar from './MiniCalendar';
import MoveToSelector from './MoveToSelector';
import CommentSection from './CommentSection';
import DatePicker from './DatePicker';
import PrioritySelector, { Priority, priorityConfig } from './PrioritySelector';
import ReminderPicker, { ReminderTime } from './ReminderPicker';
import LabelPicker from './LabelPicker';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Utility function to format reminder time
const formatReminderTime = (reminderDate: Date): string => {
    const now = new Date();
    const diff = reminderDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (diff < 0) return 'Overdue';
    if (minutes < 60) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h`;
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `in ${days}d`;
    
    return reminderDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};


interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const { updateTask, deleteTask, moveTask, duplicateTask, archiveTask, workspaces, currentWorkspace, toggleMic, isListening , enhanceText ,  } = useStore();
  
  // State declarations
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showAssignmentSelector, setShowAssignmentSelector] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const assignmentRef = useRef<HTMLDivElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);
  const aiMenuTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Edit mode states - sync with InlineTaskInput
  const [selectedDate, setSelectedDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
  const [selectedPriority, setSelectedPriority] = useState(task.priority);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels || []);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [customReminderDate, setCustomReminderDate] = useState<Date | undefined>(undefined);
  const [showDatePickerEdit, setShowDatePickerEdit] = useState(false);
  const [showPriorityPickerEdit, setShowPriorityPickerEdit] = useState(false);
  const [showReminderPickerEdit, setShowReminderPickerEdit] = useState(false);
  const [showLabelPickerEdit, setShowLabelPickerEdit] = useState(false);
  const [showMoreOptionsEdit, setShowMoreOptionsEdit] = useState(false);
  
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMoveToMenu, setShowMoveToMenu] = useState(false);

  // Load workspace members when opening assignment selector
  useEffect(() => {
    if (showAssignmentSelector && task.workspaceId) {
      loadWorkspaceMembers();
    }
  }, [showAssignmentSelector, task.workspaceId]);

  const loadWorkspaceMembers = async () => {
    try {
      const response = await workspaceAPI.getMembers(task.workspaceId);
      setWorkspaceMembers(response.data);
    } catch (error) {
      console.error('Failed to load workspace members:', error);
    }
  };

  // Handle click outside  // Close assignment selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignmentRef.current && !assignmentRef.current.contains(event.target as Node)) {
        setShowAssignmentSelector(false);
      }
    };

    if (showAssignmentSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAssignmentSelector]);

  // Close label picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelPickerRef.current && !labelPickerRef.current.contains(event.target as Node)) {
        setShowLabelPickerEdit(false);
      }
    };

    if (showLabelPickerEdit) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLabelPickerEdit]);

  // Sync edited title with task title changes
  useEffect(() => {
    setEditedTitle(task.title);
  }, [task.title]);

  // Sync selected date with task dueDate changes
  useEffect(() => {
    setSelectedDate(task.dueDate ? new Date(task.dueDate) : null);
  }, [task.dueDate]);

  // Sync selected labels with task labels when task updates
  useEffect(() => {
    setSelectedLabels(task.labels || []);
  }, [task.labels]);

  // Sync selected priority with task priority when task updates
  useEffect(() => {
    setSelectedPriority(task.priority);
  }, [task.priority]);

  // dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
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
    }, 300);
  };

  const [localBlocks, setLocalBlocks] = useState(task.contentBlocks || []);
  const blocksRef = useRef(localBlocks);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalBlocks(task.contentBlocks || []);
  }, [task.id]);

  useEffect(() => {
    blocksRef.current = localBlocks;
  }, [localBlocks]);

  // Cleanup: Save pending changes on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTask(task.id, { contentBlocks: blocksRef.current });
      }
    };
  }, [task.id, updateTask]);

  const handleBlocksChange = useCallback((newBlocks: any[]) => {
    setLocalBlocks(newBlocks);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateTask(task.id, { contentBlocks: newBlocks });
      updateTimeoutRef.current = null;
    }, 1000);
  }, [task.id, updateTask]);

  const handleTitleChange = async () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      try {
        await updateTask(task.id, { title: editedTitle.trim() });
      } catch (error) {
        console.error('Failed to update title:', error);
        setEditedTitle(task.title);
      }
    }
    setIsEditingTitle(false);
  };

  // Task-specific voice recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Update this task's title with the voice input
      updateTask(task.id, { title: transcript });
      setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  const handleAssignment = async (userId: string | null) => {
    try {
      await updateTask(task.id, { assignedTo: userId });
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      layout
      layoutId={task.id}
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
      transition={{ 
        exit: { duration: 0.3, ease: "easeOut" },
        layout: { duration: 0.3, type: "spring", bounce: 0.2 }
      }}
      className={`group relative backdrop-blur-sm border rounded-xl transition-all ${statusColors[task.status]} 
        ${isExpanded ? 'ring-2 ring-indigo-500/50 shadow-2xl z-50 overflow-visible' : 'hover:border-slate-300 dark:hover:border-slate-500/50 mb-3 overflow-visible hover:z-40 shadow-sm'}
        ${isDragging || isSortableDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
    >
      {/* Header */}
      <motion.div 
        layout="position" 
        className="p-4" 
        {...listeners}
      >
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
                    className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden"
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
                {/* Task Title - Editable */}
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTitleChange();
                        setIsEditingTitle(false);
                      } else if (e.key === 'Escape') {
                        setEditedTitle(task.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="w-full bg-transparent font-bold text-lg border-b-2 border-indigo-500 focus:outline-none text-slate-900 dark:text-white px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <motion.h3 
                    layout="position"
                    onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                    className={`font-medium text-slate-900 dark:text-slate-200 leading-tight cursor-text truncate ${task.status === TaskStatus.DONE ? 'line-through text-slate-500' : ''}`}
                    >
                    {task.title}
                    </motion.h3>
                )}
                
                {!isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                        {/* Priority Badge */}
                        {task.priority && (
                            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
                                task.priority === 'P1' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' :
                                task.priority === 'P2' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400' :
                                task.priority === 'P3' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' :
                                'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                <Flag className="w-2.5 h-2.5" />
                                {task.priority}
                            </span>
                        )}

                        {/* Labels from LabelPicker */}
                        {task.labels && task.labels.length > 0 && task.labels.map((label, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {label}
                            </span>
                        ))}

                        {/* Tags (different from labels) */}
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
                                <CalendarIcon className="w-3 h-3" />
                                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date'}</span>
                            </button>
                            
                            <AnimatePresence>
                                {showDatePicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full right-0 z-[100]"
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
                                        className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[100] p-2"
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
                {/* All toolbar buttons now hidden until hover */}
                
                {/* Audio Recording Button */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        handleVoiceInput();
                    }}
                    className={`transition-opacity p-1 opacity-0 group-hover:opacity-100 ${
                        isRecording 
                            ? 'text-red-500 animate-pulse' 
                            : 'text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400'
                    }`}
                    title={isRecording ? "Recording..." : "Voice input to update task"}
                >
                    <Mic className="w-4 h-4" />
                </button>

                {/* AI Actions - Fixed Dropdown */}
                <div 
                    className="relative"
                    onMouseEnter={handleAiMouseEnter}
                    onMouseLeave={handleAiMouseLeave}
                >
                    <button 
                        onClick={(e) => e.stopPropagation()}
                        className="transition-opacity text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 p-1 opacity-0 group-hover:opacity-100"
                        title="AI Enhance"
                    >
                        <Wand2 className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                        {showAiMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                onMouseEnter={handleAiMouseEnter}
                                onMouseLeave={handleAiMouseLeave}
                                className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-[100]"
                            >
                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                    AI Actions
                                </div>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const enhanced = await enhanceText(task.title, 'PROFESSIONAL');
                                        updateTask(task.id, { title: (await enhanced).enhancedText });
                                        setShowAiMenu(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-200 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3 text-purple-500 dark:text-purple-400" /> Make Professional
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const breakdown = await enhanceText(task.title, 'BREAK_DOWN');
                                        const result = await breakdown;
                                        const lines = result.enhancedText.split('\n').filter(l => l.trim());
                                        const newBlocks = lines.map((line: string, i: number) => ({
                                            id: `b-${Date.now()}-${i}`,
                                            type: 'checklist' as const,
                                            content: line.replace(/^[-*]\s*/, ''),
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Edit Button - Beside AI Enhance */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsEditingTitle(true);
                        setTimeout(() => titleInputRef.current?.focus(), 50);
                    }}
                    className="transition-opacity text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 opacity-0 group-hover:opacity-100"
                    title="Edit"
                >
                    <Edit className="w-4 h-4" />
                </button>

                {/* Labels Display */}
                {task.labels && task.labels.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap ml-auto mr-2">
                        {/* Priority */}
                        {task.priority && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color} ${priorityConfig[task.priority].borderColor} border`}>
                                <Flag className="w-3 h-3" />
                                {task.priority}
                            </span>
                        )}

                        {/* Reminder */}
                        {task.reminder && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                <Bell className="w-3 h-3" />
                                {formatReminderTime(new Date(task.reminder))}
                            </span>
                        )}

                        {task.labels.slice(0, 3).map((label, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                                {label}
                            </span>
                        ))}
                        {task.labels.length > 3 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                +{task.labels.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                    {/* Assignment Button - Only show in Team workspaces */}
                    {currentWorkspace && !currentWorkspace.isPersonal && (
                      <div className="relative" ref={assignmentRef}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAssignmentSelector(!showAssignmentSelector);
                          }}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title={task.assignedTo ? "Change assignee" : "Assign task"}
                        >
                          {task.assignedTo ? (
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              <UserCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <Users className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {showAssignmentSelector && (
                          <TaskAssignmentSelector
                            members={workspaceMembers}
                            currentAssignee={task.assignedTo}
                            onAssign={handleAssignment}
                            onClose={() => setShowAssignmentSelector(false)}
                          />
                        )}
                      </div>
                    )}

                    {/* More Options - Now includes pickers */}
                    <div 
                        className="relative"
                        ref={moreOptionsRef}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMoreOptions(!showMoreOptions);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="More options"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {showMoreOptions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-1">
                                        {/* Date Picker Option */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMoreOptions(false);
                                                setShowDatePickerEdit(true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <CalendarIcon className="w-4 h-4" />
                                            <span>{task.dueDate ? 'Change date' : 'Set due date'}</span>
                                        </button>

                                        {/* Priority Picker Option */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMoreOptions(false);
                                                setShowPriorityPickerEdit(true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <Flag className="w-4 h-4" />
                                            <span>{task.priority ? 'Change priority' : 'Set priority'}</span>
                                        </button>

                                        {/* Label Picker Option */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMoreOptions(false);
                                                setShowLabelPickerEdit(true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <Tag className="w-4 h-4" />
                                            <span>Add labels</span>
                                        </button>

                                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                                        {/* Duplicate */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                duplicateTask(task.id);
                                                setShowMoreOptions(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            <span>Duplicate</span>
                                        </button>

                                        {/* Archive */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                archiveTask(task.id);
                                                setShowMoreOptions(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <Archive className="w-4 h-4" />
                                            <span>Archive</span>
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTask(task.id);
                                                setShowMoreOptions(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Picker Modals - Rendered outside dropdown */}
                        <AnimatePresence>
                            {showDatePickerEdit && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 z-[60]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DatePicker
                                        selectedDate={selectedDate}
                                        onSelect={(date) => {
                                            setSelectedDate(date);
                                            updateTask(task.id, { dueDate: date });
                                            setShowDatePickerEdit(false);
                                        }}
                                        onClose={() => setShowDatePickerEdit(false)}
                                    />
                                </motion.div>
                            )}

                            {showPriorityPickerEdit && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 z-[60]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <PrioritySelector
                                        selectedPriority={selectedPriority}
                                        onSelect={(priority) => {
                                            setSelectedPriority(priority);
                                            updateTask(task.id, { priority });
                                            setShowPriorityPickerEdit(false);
                                        }}
                                        onClose={() => setShowPriorityPickerEdit(false)}
                                    />
                                </motion.div>
                            )}

                            {showLabelPickerEdit && (
                                <div ref={labelPickerRef}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 z-[60]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <LabelPicker
                                            selectedLabels={selectedLabels}
                                            onLabelsChange={(labels) => {
                                                setSelectedLabels(labels);
                                                updateTask(task.id, { labels });
                                            }}
                                            onClose={() => setShowLabelPickerEdit(false)}
                                        />
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                    {/* Expand/Collapse Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            </motion.div>

      {/* Expanded Content - The Block Editor */}
      <AnimatePresence mode="sync">
        {isExpanded && (
          <motion.div
            layout
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ 
                height: 'auto', 
                opacity: 1,
                transition: {
                    height: { duration: 0.4, type: "spring", bounce: 0.2 },
                    opacity: { duration: 0.25, delay: 0.1 }
                },
                transitionEnd: { overflow: 'visible' }
            }}
            exit={{ 
                height: 0, 
                opacity: 0, 
                overflow: 'hidden',
                transition: {
                    height: { duration: 0.3, type: "spring", bounce: 0 },
                    opacity: { duration: 0.2 }
                }
            }}
            className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20"
          >
            <div className="p-4 cursor-text relative" onClick={(e) => e.stopPropagation()}>
                <BlockEditor 
                    blocks={localBlocks} 
                    onChange={handleBlocksChange} 
                />
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/50 p-3 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 flex-wrap">
                {/* Due Date */}
                {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}

                {/* Priority Badge */}
                {task.priority && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        task.priority === 'P1' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' :
                        task.priority === 'P2' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800' :
                        task.priority === 'P3' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                        'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}>
                        <Flag className="w-3 h-3" />
                        <span>{task.priority}</span>
                    </div>
                )}
            </div>
            </div>

            {/* Comment Section */}
            <div className="px-4 pb-4">
                <CommentSection taskId={task.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;