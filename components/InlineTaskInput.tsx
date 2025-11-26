import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Flag, Clock, MoreHorizontal, Mic, X, Tag, MapPin, CalendarClock, Puzzle, ListTodo, ChevronDown, CheckCircle, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import DatePicker from './DatePicker';
import PrioritySelector, { Priority, priorityConfig } from './PrioritySelector';
import ReminderPicker, { ReminderTime } from './ReminderPicker';
import LabelPicker from './LabelPicker';
import SubTasksPicker from './SubTasksPicker';

interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

interface InlineTaskInputProps {
    onAdd: (title: string, description?: string, date?: Date | null, priority?: Priority, reminder?: ReminderTime, customReminderDate?: Date, labels?: string[], subtasks?: SubTask[], workspaceId?: string) => void;
    onCancel: () => void;
}

const InlineTaskInput: React.FC<InlineTaskInputProps> = ({ onAdd, onCancel }) => {
    const { isListening, transcript, toggleMic, workspaces, currentWorkspace } = useStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedPriority, setSelectedPriority] = useState<Priority>(null);
    const [selectedReminder, setSelectedReminder] = useState<ReminderTime>(null);
    const [customReminderDate, setCustomReminderDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const [showSubTasksPicker, setShowSubTasksPicker] = useState(false);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [subtasks, setSubtasks] = useState<SubTask[]>([]);
    const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspace);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const priorityPickerRef = useRef<HTMLDivElement>(null);
    const reminderPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, []);

    // Update title from voice transcript
    useEffect(() => {
        if (transcript && transcript !== "Listening...") {
            setTitle(transcript);
        }
    }, [transcript]);

    // Close pickers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
            if (priorityPickerRef.current && !priorityPickerRef.current.contains(event.target as Node)) {
                setShowPriorityPicker(false);
            }
            if (reminderPickerRef.current && !reminderPickerRef.current.contains(event.target as Node)) {
                setShowReminderPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(
                title,
                description || undefined,
                selectedDate,
                selectedPriority,
                selectedReminder,
                customReminderDate,
                selectedLabels.length > 0 ? selectedLabels : undefined,
                subtasks.length > 0 ? subtasks : undefined,
                selectedWorkspace?.id
            );
            setTitle('');
            setDescription('');
            setSelectedDate(null);
            setSelectedPriority(null);
            setSelectedReminder(null);
            setCustomReminderDate(undefined);
            setSelectedLabels([]);
            setSubtasks([]);
        }
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
            {/* Title Input */}
            <div className="mb-3 relative">
                <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Task name"
                    className="w-full px-0 py-1 text-[15px] font-medium bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pr-8"
                />
                <button 
                    type="button"
                    onClick={toggleMic}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 transition-colors ${
                        isListening 
                            ? 'text-red-500 animate-pulse' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title={isListening ? "Stop recording" : "Start voice input"}
                >
                    <Mic className="w-4 h-4" />
                </button>
            </div>

            {/* Description Input */}
            <div className="mb-3">
                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent text-sm md:text-base text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:outline-none resize-none mb-4 min-h-[60px] md:min-h-[40px] touch-manipulation"
                    rows={1}
                />

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {/* Date Button */}
                    <div className="relative" ref={datePickerRef}>
                        <button 
                            type="button" 
                            onClick={() => {
                                setShowDatePicker(!showDatePicker);
                                setShowPriorityPicker(false);
                                setShowReminderPicker(false);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                                selectedDate
                                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">{selectedDate ? formatDate(selectedDate) : 'Date'}</span>
                            {selectedDate && (
                                <X 
                                    className="w-3 h-3 ml-1" 
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(null); }}
                                />
                            )}
                        </button>
                        <AnimatePresence>
                            {showDatePicker && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute left-0 top-full mt-2 z-[9999]"
                                >
                                    <DatePicker 
                                        selectedDate={selectedDate}
                                        onSelect={setSelectedDate}
                                        onClose={() => setShowDatePicker(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Priority Button */}
                    <div className="relative" ref={priorityPickerRef}>
                        <button 
                            type="button"
                            onClick={() => {
                                setShowPriorityPicker(!showPriorityPicker);
                                setShowDatePicker(false);
                                setShowReminderPicker(false);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                                selectedPriority
                                    ? `${priorityConfig[selectedPriority].borderColor} ${priorityConfig[selectedPriority].bgColor} ${priorityConfig[selectedPriority].color}`
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Flag className="w-3.5 h-3.5" />
                            <span className="text-xs">{selectedPriority || 'Priority'}</span>
                            {selectedPriority && (
                                <X 
                                    className="w-3 h-3 ml-1" 
                                    onClick={(e) => { e.stopPropagation(); setSelectedPriority(null); }}
                                />
                            )}
                        </button>
                        <AnimatePresence>
                           {/* Priority Picker */}
                        {showPriorityPicker && (
                            <div ref={priorityPickerRef} className="absolute top-full left-0 mt-2 z-50">
                                <PrioritySelector
                                    selectedPriority={selectedPriority}
                                    onChange={(priority) => {
                                        setSelectedPriority(priority);
                                        setShowPriorityPicker(false);
                                    }}
                                />
                            </div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Reminder Button */}
                    <div className="relative" ref={reminderPickerRef}>
                        <button 
                            type="button"
                            onClick={() => {
                                setShowReminderPicker(!showReminderPicker);
                                setShowDatePicker(false);
                                setShowPriorityPicker(false);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                                selectedReminder
                                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">{selectedReminder || 'Reminders'}</span>
                            {selectedReminder && (
                                <X 
                                    className="w-3 h-3 ml-1" 
                                    onClick={(e) => { e.stopPropagation(); setSelectedReminder(null); setCustomReminderDate(undefined); }}
                                />
                            )}
                        </button>
                        <AnimatePresence>
                            {showReminderPicker && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute left-0 top-full mt-2 z-[9999]"
                                >
                                    <ReminderPicker 
                                        selectedReminder={selectedReminder}
                                        onSelect={(reminder, customDate) => {
                                            setSelectedReminder(reminder);
                                            if (customDate) setCustomReminderDate(customDate);
                                        }}
                                        onClose={() => setShowReminderPicker(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* More Options */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowMoreOptions(!showMoreOptions)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation"
                            title="More options"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        <AnimatePresence>
                            {showMoreOptions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onMouseLeave={() => setShowMoreOptions(false)}
                                    className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50"
                                >
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowLabelPicker(!showLabelPicker);
                                                setShowMoreOptions(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                                        >
                                            <Tag className="w-4 h-4" />
                                            <span>Labels</span>
                                            {selectedLabels.length > 0 && (
                                                <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                    {selectedLabels.length}
                                                </span>
                                            )}
                                        </button>
                                        {showLabelPicker && (
                                            <div className="absolute left-full top-0 ml-1">
                                                <LabelPicker 
                                                    selectedLabels={selectedLabels}
                                                    onLabelsChange={setSelectedLabels}
                                                    onClose={() => setShowLabelPicker(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSubTasksPicker(!showSubTasksPicker);
                                                setShowMoreOptions(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                                        >
                                            <ListTodo className="w-4 h-4" />
                                            <span>Sub-tasks</span>
                                            {subtasks.length > 0 && (
                                                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                    {subtasks.length}
                                                </span>
                                            )}
                                        </button>
                                        {showSubTasksPicker && (
                                            <div className="absolute left-full top-0 ml-1">
                                                <SubTasksPicker 
                                                    subtasks={subtasks}
                                                    onSubTasksChange={setSubtasks}
                                                    onClose={() => setShowSubTasksPicker(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-400 flex items-center gap-3"
                                        disabled
                                    >
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <span>Location</span>
                                        <span className="ml-auto text-xs text-slate-400">Soon</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-400 flex items-center gap-3"
                                        disabled
                                    >
                                        <CalendarClock className="w-4 h-4 text-orange-500" />
                                        <span>Deadline</span>
                                        <span className="ml-auto text-xs text-slate-400">Soon</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-1 relative">
                        <button 
                            type="button" 
                            onClick={() => setShowWorkspaceSelector(!showWorkspaceSelector)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                        >
                            <div className="w-4 h-4 rounded border-2 border-slate-400 flex items-center justify-center">
                                <span className="w-2 h-2 bg-slate-400 rounded-sm"></span>
                            </div>
                            <span>{selectedWorkspace?.name || 'Select workspace'}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {/* Workspace Dropdown */}
                        <AnimatePresence>
                            {showWorkspaceSelector && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-[9999] max-h-64 overflow-y-auto"
                                >
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                        Select Workspace
                                    </div>
                                    {workspaces.map(workspace => (
                                        <button
                                            key={workspace.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedWorkspace(workspace);
                                                setShowWorkspaceSelector(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors ${
                                                selectedWorkspace?.id === workspace.id
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                                    : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${
                                                workspace.type === 'PERSONAL'
                                                    ? 'bg-blue-500'
                                                    : 'bg-purple-500'
                                            }`} />
                                            <span className="flex-1">{workspace.name}</span>
                                            {selectedWorkspace?.id === workspace.id && (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setSelectedPriority(null);
                                            setSelectedReminder(null);
                                            setCustomReminderDate(undefined);
                                            setSelectedLabels([]);
                                            setSubtasks([]);
                                            setShowMoreOptions(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 flex items-center gap-3 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Clear All
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e)}
                            disabled={!title.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InlineTaskInput;
