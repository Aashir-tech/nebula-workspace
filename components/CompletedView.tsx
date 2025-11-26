import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';

export const CompletedView: React.FC = () => {
  const { tasks, updateTask, deleteTask } = useStore();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  // Filter completed and non-archived tasks
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE && !t.archived);
  
  const toggleTaskSelection = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };
  
  const handleBulkRestore = async () => {
    for (const taskId of selectedTasks) {
      await updateTask(taskId, { status: TaskStatus.TODO });
    }
    setSelectedTasks(new Set());
  };
  
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.size} tasks?`)) {
      for (const taskId of selectedTasks) {
        await deleteTask(taskId);
      }
      setSelectedTasks(new Set());
    }
  };
  
  return (
    <LayoutGroup id="completed">
      <div className="p-4 md:p-8 max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                Completed
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {completedTasks.length} completed {completedTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            
            {/* Bulk Actions */}
            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedTasks.size} selected
                </span>
                <button
                  onClick={handleBulkRestore}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1">
          {completedTasks.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 border-dashed">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-900 dark:text-white">No completed tasks</p>
              <p className="text-sm">When you complete tasks, they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div 
                  key={task.id} 
                  className="relative group"
                  onClick={() => toggleTaskSelection(task.id)}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTaskSelection(task.id);
                      }}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  
                  {/* Task Card */}
                  <div className={`transition-all ${selectedTasks.has(task.id) ? 'ml-8' : ''}`}>
                    <TaskCard task={task} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
};

export default CompletedView;
