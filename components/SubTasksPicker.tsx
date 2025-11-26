import React, { useState } from 'react';
import { ListTodo, X, Plus } from 'lucide-react';

interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

interface SubTasksPickerProps {
    subtasks: SubTask[];
    onSubTasksChange: (subtasks: SubTask[]) => void;
    onClose: () => void;
}

const SubTasksPicker: React.FC<SubTasksPickerProps> = ({ subtasks, onSubTasksChange, onClose }) => {
    const [newSubtask, setNewSubtask] = useState('');

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const subtask: SubTask = {
                id: `subtask-${Date.now()}`,
                title: newSubtask.trim(),
                completed: false
            };
            onSubTasksChange([...subtasks, subtask]);
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (id: string) => {
        onSubTasksChange(subtasks.filter(st => st.id !== id));
    };

    const handleToggleSubtask = (id: string) => {
        onSubTasksChange(subtasks.map(st => 
            st.id === id ? { ...st, completed: !st.completed } : st
        ));
    };

    return (
        <div className="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sub-tasks</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
                <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                    {subtasks.map((subtask) => (
                        <div
                            key={subtask.id}
                            className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-700/50"
                        >
                            <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => handleToggleSubtask(subtask.id)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {subtask.title}
                            </span>
                            <button
                                onClick={() => handleRemoveSubtask(subtask.id)}
                                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Subtask */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="Add sub-task..."
                    className="flex-1 text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    onClick={handleAddSubtask}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SubTasksPicker;
