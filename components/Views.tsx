import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import TaskCard from './TaskCard';
import BentoGrid from './BentoGrid';
import { TaskStatus } from '../types';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import { Plus, X, Inbox, Calendar, Hash, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

// Inline Task Input Component
const InlineTaskInput = ({ onAdd, onCancel, placeholder = "Type a name..." }: { onAdd: (title: string) => void, onCancel: () => void, placeholder?: string }) => {
    const [title, setTitle] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(title);
            setTitle('');
        }
    };

    return (
        <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit} 
            className="mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg"
        >
            <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none mb-3"
            />
            <div className="flex justify-end gap-2">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={!title.trim()} 
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                    Add Task
                </button>
            </div>
        </motion.form>
    );
};

export const OverviewView: React.FC = () => {
    return (
        <LayoutGroup id="overview">
             <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <BentoGrid />
             </div>
        </LayoutGroup>
    );
}

// -- Kanban Board --
export const BoardView: React.FC = () => {
  const { tasks, moveTask, addTask } = useStore();
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  
  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-500' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-500' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-emerald-500' }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, status);
    }
  };

  return (
    <LayoutGroup id="board">
        <div className="flex h-full w-full gap-6 overflow-x-auto p-4 snap-x snap-mandatory">
        {columns.map(col => (
            <div 
            key={col.id}
            className="flex-shrink-0 w-80 md:w-96 flex flex-col h-full snap-start"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            >
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h2 className="font-semibold text-slate-700 dark:text-slate-300">{col.title}</h2>
                    <span className="text-slate-500 dark:text-slate-600 text-xs font-mono bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-1.5 rounded">
                        {tasks.filter(t => t.status === col.id).length}
                    </span>
                </div>
                <button 
                    onClick={() => setAddingToColumn(col.id)}
                    className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-900/20 rounded-2xl p-2 border border-slate-200 dark:border-white/5 overflow-y-auto min-h-[200px] custom-scrollbar">
                {tasks.filter(t => t.status === col.id).map(task => (
                <TaskCard key={task.id} task={task} />
                ))}
                
                <AnimatePresence>
                    {addingToColumn === col.id && (
                        <InlineTaskInput 
                            onAdd={(title) => {
                                addTask(title, col.id);
                                setAddingToColumn(null);
                            }}
                            onCancel={() => setAddingToColumn(null)}
                        />
                    )}
                </AnimatePresence>

                {tasks.filter(t => t.status === col.id).length === 0 && !addingToColumn && (
                    <button 
                        onClick={() => setAddingToColumn(col.id)}
                        className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-xl m-2 opacity-50 hover:opacity-100 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                    >
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-2" />
                        <span className="text-slate-500 dark:text-slate-600 text-sm group-hover:text-indigo-500">Add Task</span>
                    </button>
                )}
            </div>
            </div>
        ))}
        </div>
    </LayoutGroup>
  );
};

// -- List View --
export const ListView: React.FC = () => {
    const { tasks, addTask } = useStore();
    const [statusFilter, setStatusFilter] = React.useState<TaskStatus | 'ALL'>('ALL');
    const [isAdding, setIsAdding] = useState(false);
    
    const filteredTasks = statusFilter === 'ALL' 
        ? tasks 
        : tasks.filter(t => t.status === statusFilter);
    
    const filterOptions = [
        { label: 'All', value: 'ALL' as const, count: tasks.length },
        { label: 'To Do', value: TaskStatus.TODO, count: tasks.filter(t => t.status === TaskStatus.TODO).length },
        { label: 'In Progress', value: TaskStatus.IN_PROGRESS, count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
        { label: 'Done', value: TaskStatus.DONE, count: tasks.filter(t => t.status === TaskStatus.DONE).length }
    ];
    
    return (
        <LayoutGroup id="list">
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <div className="max-w-3xl mx-auto">
                {/* Filter Chips */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === option.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {option.label} <span className="opacity-60">({option.count})</span>
                        </button>
                    ))}
                </div>
                
                {/* Task List */}
                <div className="space-y-2 pb-20">
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    
                    <AnimatePresence>
                        {isAdding && (
                            <InlineTaskInput 
                                onAdd={(title) => {
                                    addTask(title, statusFilter === 'ALL' ? TaskStatus.TODO : statusFilter);
                                    setIsAdding(false); // Keep open? Maybe better to close for now
                                }}
                                onCancel={() => setIsAdding(false)}
                            />
                        )}
                    </AnimatePresence>

                    {!isAdding && (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 flex items-center gap-2 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all px-4 group"
                        >
                            <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-medium">Add task</span>
                        </button>
                    )}

                    {filteredTasks.length === 0 && !isAdding && (
                        <div className="text-center py-12 text-slate-500">
                            No tasks found
                        </div>
                    )}
                </div>
            </div>

            </div>
        </LayoutGroup>
    );
};

// -- Grid View --
export const GridView: React.FC = () => {
    const { tasks, addTask } = useStore();
    const [statusFilter, setStatusFilter] = React.useState<TaskStatus | 'ALL'>('ALL');
    const [isAdding, setIsAdding] = useState(false);
    
    const filteredTasks = statusFilter === 'ALL' 
        ? tasks 
        : tasks.filter(t => t.status === statusFilter);
    
    const filterOptions = [
        { label: 'All', value: 'ALL' as const, count: tasks.length },
        { label: 'To Do', value: TaskStatus.TODO, count: tasks.filter(t => t.status === TaskStatus.TODO).length },
        { label: 'In Progress', value: TaskStatus.IN_PROGRESS, count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
        { label: 'Done', value: TaskStatus.DONE, count: tasks.filter(t => t.status === TaskStatus.DONE).length }
    ];
    
    return (
        <LayoutGroup id="grid">
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                {/* Filter Chips */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === option.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {option.label} <span className="opacity-60">({option.count})</span>
                        </button>
                    ))}
                </div>
                
                {/* Task Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    
                    {/* Add Card */}
                    {isAdding ? (
                        <div className="col-span-1">
                             <InlineTaskInput 
                                onAdd={(title) => {
                                    addTask(title, statusFilter === 'ALL' ? TaskStatus.TODO : statusFilter);
                                    setIsAdding(false);
                                }}
                                onCancel={() => setIsAdding(false)}
                            />
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group"
                        >
                            <Plus className="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 mb-2" />
                            <span className="text-slate-400 dark:text-slate-500 text-sm group-hover:text-indigo-500">Add New Task</span>
                        </button>
                    )}
                </div>
            </div>

        </LayoutGroup>
    );
};

// -- Inbox View --
export const InboxView: React.FC = () => {
    const { invitations, acceptInvitation, rejectInvitation } = useStore();
    
    return (
        <LayoutGroup id="inbox">
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                    <Inbox className="w-8 h-8 text-indigo-500" />
                    Inbox
                </h2>
                {invitations.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 border-dashed">
                        <Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-900 dark:text-white">All caught up!</p>
                        <p className="text-sm">No pending invitations or notifications.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map(invitation => (
                            <div key={invitation.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{invitation.invitedBy.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-medium text-lg">
                                            <span className="font-bold">{invitation.invitedBy.name}</span> invited you to <span className="font-bold">{invitation.workspace.name}</span>
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                                {invitation.role}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(invitation.createdAt).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={() => rejectInvitation(invitation.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        onClick={() => acceptInvitation(invitation.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-500/20"
                                    >
                                        Accept Invitation
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </LayoutGroup>
    );
};

// -- Today View --
export const TodayView: React.FC = () => {
    const { tasks } = useStore();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        // Show tasks due today or overdue that are not done
        return due <= today && t.status !== TaskStatus.DONE;
    });

    return (
        <LayoutGroup id="today">
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-emerald-500" />
                    Today
                </h2>
                <div className="space-y-2 pb-20">
                    {todayTasks.length === 0 ? (
                         <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 border-dashed">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-900 dark:text-white">No tasks for today</p>
                            <p className="text-sm">Enjoy your day off!</p>
                        </div>
                    ) : (
                        todayTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    )}
                </div>
            </div>
        </LayoutGroup>
    );
};

// -- Filters & Labels View --
export const FiltersView: React.FC = () => {
    const { tasks } = useStore();
    // Aggregate all unique tags
    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const filteredTasks = selectedTag 
        ? tasks.filter(t => t.tags.includes(selectedTag))
        : tasks;

    return (
        <LayoutGroup id="filters">
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                    <Hash className="w-8 h-8 text-orange-500" />
                    Filters & Labels
                </h2>
                
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Labels</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTag === null
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            All Tasks
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                    selectedTag === tag
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Tag className="w-3 h-3" />
                                {tag}
                            </button>
                        ))}
                        {allTags.length === 0 && (
                            <span className="text-sm text-slate-500 italic">No labels found. Add #tags to your tasks!</span>
                        )}
                    </div>
                </div>

                <div className="space-y-2 pb-20">
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </div>
        </LayoutGroup>
    );
};

// -- Calendar View --
export const CalendarView: React.FC = () => {
    const { tasks } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getTasksForDay = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        return tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateStr);
    };

    return (
        <LayoutGroup id="calendar">
            <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-indigo-500" />
                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                        {/* Empty cells for previous month */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50" />
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayTasks = getTasksForDay(day);
                            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                            return (
                                <div key={day} className={`min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-800/50 relative group ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                                    <div className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {day}
                                    </div>
                                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                        {dayTasks.map(task => (
                                            <div key={task.id} className="text-[10px] px-1.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 truncate shadow-sm text-slate-700 dark:text-slate-300">
                                                {task.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
};
