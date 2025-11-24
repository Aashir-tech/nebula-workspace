
import React from 'react';
import { useStore } from '../context/StoreContext';
import TaskCard from './TaskCard';
import BentoGrid from './BentoGrid';
import { TaskStatus } from '../types';
import { motion, LayoutGroup } from 'framer-motion';
import { Plus } from 'lucide-react';

export const OverviewView: React.FC = () => {
    return (
        <LayoutGroup id="overview">
             <BentoGrid />
        </LayoutGroup>
    );
}

// -- Kanban Board --
export const BoardView: React.FC = () => {
  const { tasks, moveTask, addTask } = useStore();
  
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
        <div className="flex h-full gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory">
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
                    <h2 className="font-semibold text-slate-300">{col.title}</h2>
                    <span className="text-slate-600 text-xs font-mono bg-slate-900/50 border border-slate-800 px-1.5 rounded">
                        {tasks.filter(t => t.status === col.id).length}
                    </span>
                </div>
                <button 
                    onClick={() => addTask('New Task')}
                    className="p-1 text-slate-500 hover:bg-slate-800 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-slate-900/20 rounded-2xl p-2 border border-white/5 overflow-y-auto min-h-[200px] custom-scrollbar">
                {tasks.filter(t => t.status === col.id).map(task => (
                <TaskCard key={task.id} task={task} />
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/50 rounded-xl m-2 opacity-50">
                        <span className="text-slate-600 text-sm">Drop here</span>
                    </div>
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
    const { tasks } = useStore();
    return (
        <LayoutGroup id="list">
            <div className="max-w-3xl mx-auto space-y-2 p-2">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </LayoutGroup>
    );
};

// -- Grid View --
export const GridView: React.FC = () => {
    const { tasks } = useStore();
    return (
        <LayoutGroup id="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </LayoutGroup>
    );
};
