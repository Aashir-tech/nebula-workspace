import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import TaskCard from './TaskCard';
import InboxEmptyState from './InboxEmptyState';
import InlineTaskInput from './InlineTaskInput';
import BentoGrid from './BentoGrid';
import { TaskStatus } from '../types';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import { Plus, X, Inbox, Calendar, Hash, Tag, ChevronLeft, ChevronRight, Archive, RotateCcw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Inline Task Input Component


export const OverviewView: React.FC = () => {
    const { tasks } = useStore();
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    
    // Get all unique tags
    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));
    
    // Apply filters
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        const matchesTag = !selectedTag || task.tags.includes(selectedTag);
        return matchesStatus && matchesTag;
    });
    
    const filterOptions = [
        { label: 'All', value: 'ALL' as const, count: tasks.length },
        { label: 'To Do', value: TaskStatus.TODO, count: tasks.filter(t => t.status === TaskStatus.TODO).length },
        { label: 'In Progress', value: TaskStatus.IN_PROGRESS, count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
        { label: 'Done', value: TaskStatus.DONE, count: tasks.filter(t => t.status === TaskStatus.DONE).length }
    ];
    
    return (
        <LayoutGroup id="overview">
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                {/* Filters Section */}
                <div className="mb-6 space-y-4">
                    {/* Status Filters */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Filter by Status</h3>
                        <div className="flex gap-2 flex-wrap">
                            {filterOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        statusFilter === option.value
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {option.label} <span className="opacity-60">({option.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Tag Filters */}
                    {allTags.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Filter by Label</h3>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        selectedTag === null
                                            ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    All Labels
                                </button>
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                            selectedTag === tag
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <BentoGrid />
            </div>
        </LayoutGroup>
    );
};

// Droppable Column Component for Kanban
const DroppableColumn: React.FC<{ 
  id: string; 
  children: React.ReactNode;
  className?: string;
}> = ({ id, children, className }) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
};

// -- Kanban Board --
export const BoardView: React.FC = () => {
  const { tasks, moveTask, addTask } = useStore();
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-500' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-500' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-emerald-500' }
  ];

  // Configure sensors for smooth dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;
    
    // Check if we're over a column container
    const overColumnId = over.id as string;
    
    // If hovering over a column and task is not in that column, move it
    if (Object.values(TaskStatus).includes(overColumnId as TaskStatus)) {
      if (activeTask.status !== overColumnId) {
        moveTask(active.id as string, overColumnId as TaskStatus);
      }
    } else {
      // We're over another task, find which column it belongs to
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask && activeTask.status !== overTask.status) {
        moveTask(active.id as string, overTask.status);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <LayoutGroup id="board">
        <div className="flex h-full w-full gap-6 overflow-x-auto p-4 snap-x snap-mandatory">
          {columns.map(col => (
            <DroppableColumn
              key={col.id}
              id={col.id}
              className="flex-shrink-0 w-80 md:w-96 flex flex-col h-full snap-start"
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

              <SortableContext
                id={col.id}
                items={tasks.filter(t => t.status === col.id).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div 
                  className="flex-1 bg-slate-50 dark:bg-slate-900/20 rounded-2xl p-2 border border-slate-200 dark:border-white/5 overflow-y-auto min-h-[200px] custom-scrollbar"
                  data-status={col.id}
                >
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <TaskCard key={task.id} task={task} isDragging={activeId === task.id} />
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
              </SortableContext>
            </DroppableColumn>
          ))}
        </div>
      </LayoutGroup>

      {/* Drag Overlay for smooth visual feedback */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3 scale-105">
            <TaskCard task={activeTask} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// -- List View --
export const ListView: React.FC = () => {
    const { tasks, addTask } = useStore();
    const [statusFilter, setStatusFilter] = React.useState<TaskStatus | 'ALL'>('ALL');
    const [isAdding, setIsAdding] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const filteredTasks = statusFilter === 'ALL' 
        ? tasks 
        : tasks.filter(t => t.status === statusFilter);
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    // Reset to page 1 when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);
    
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
                <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
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
                    
                    {/* Items per page selector */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
                
                {/* Task List */}
                <div className="space-y-2 pb-4">
                    {paginatedTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    
                    <AnimatePresence>
                        {isAdding && (
                            <InlineTaskInput 
                                onAdd={(title) => {
                                    addTask(title, statusFilter === 'ALL' ? TaskStatus.TODO : statusFilter);
                                    setIsAdding(false);
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
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-500">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    
    const filteredTasks = statusFilter === 'ALL' 
        ? tasks 
        : tasks.filter(t => t.status === statusFilter);
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    // Reset to page 1 when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);
    
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
                <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
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
                    
                    {/* Items per page selector */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={6}>6 per page</option>
                        <option value={12}>12 per page</option>
                        <option value={24}>24 per page</option>
                        <option value={48}>48 per page</option>
                    </select>
                </div>
                
                {/* Task Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {paginatedTasks.map(task => (
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
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-500">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    // Show smart pagination: first, last, current, and nearby pages
                                    if (totalPages <= 7) return i + 1;
                                    if (i === 0) return 1;
                                    if (i === 6) return totalPages;
                                    if (currentPage <= 4) return i + 1;
                                    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
                                    return currentPage - 3 + i;
                                }).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </LayoutGroup>
    );
};

// -- Inbox View --
export const InboxView: React.FC = () => {
    const { tasks, addTask } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    
    // Filter out completed tasks from inbox
    const inboxTasks = tasks.filter(t => t.status !== TaskStatus.DONE && !t.archived);
    // For now assuming all tasks are shown in inbox for simplicity, or filter by 'INBOX' tag/project if implemented
    // Based on requirement "Sidebar inbox to be exactly shown like attached screenshot"
    // We'll treat the main task list as Inbox for now.

    return (
        <LayoutGroup id="inbox">
            <div className="max-w-3xl mx-auto p-4 md:p-8 h-full flex flex-col">

                <div className="flex-1">
                    {inboxTasks.length === 0 && !isAdding ? (
                        <InboxEmptyState onAddClick={() => setIsAdding(true)} />
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {inboxTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </AnimatePresence>
                            
                            {!isAdding && (
                                <button 
                                    onClick={() => setIsAdding(true)}
                                    className="group flex items-center gap-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors py-2 px-1"
                                >
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Add task</span>
                                </button>
                            )}
                        </div>
                    )}

                    {isAdding && (
                        <div className="mt-2">
                            <InlineTaskInput 
                                onAdd={(title, description, date, priority, reminder, customReminderDate, labels, subtasks, workspaceId) => {
                                    // Pass everything to addTask
                                    addTask(title, priority, date, labels, subtasks);
                                    setIsAdding(false);
                                }}
                                onCancel={() => setIsAdding(false)}
                            />
                        </div>
                    )}
                </div>
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
    const { tasks, updateTask } = useStore();
    // Aggregate all unique tags
    const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    const archivedTasks = tasks.filter(t => t.archived);
    const filteredTasks = showArchived 
        ? archivedTasks
        : selectedTag 
            ? tasks.filter(t => t.tags.includes(selectedTag) && !t.archived)
            : tasks.filter(t => !t.archived);

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
                            onClick={() => { setSelectedTag(null); setShowArchived(false); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTag === null && !showArchived
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            All Tasks
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => { setSelectedTag(tag); setShowArchived(false); }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                    selectedTag === tag && !showArchived
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Tag className="w-3 h-3" />
                                {tag}
                            </button>
                        ))}
                        <button
                            onClick={() => { setShowArchived(true); setSelectedTag(null); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                showArchived
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Archive className="w-3 h-3" />
                            Archived ({archivedTasks.length})
                        </button>
                        {allTags.length === 0 && !showArchived && (
                            <span className="text-sm text-slate-500 italic">No labels found. Add #tags to your tasks!</span>
                        )}
                    </div>
                </div>

                {showArchived && filteredTasks.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            Viewing archived tasks
                        </span>
                        <button
                            onClick={() => {
                                filteredTasks.forEach(task => updateTask(task.id, { archived: false }));
                            }}
                            className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Unarchive All
                        </button>
                    </div>
                )}

                <div className="space-y-2 pb-20">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            {showArchived ? 'No archived tasks' : 'No tasks with this filter'}
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    )}
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
