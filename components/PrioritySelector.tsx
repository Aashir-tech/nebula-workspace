import React from 'react';
import { Flag } from 'lucide-react';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4' | null;

interface PrioritySelectorProps {
    selectedPriority: Priority;
    onSelect?: (priority: Priority) => void;
    onChange?: (priority: Priority) => void;
    onClose?: () => void;
}

const priorityConfig = {
    P1: { label: 'Priority 1', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800', description: 'Urgent' },
    P2: { label: 'Priority 2', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800', description: 'High' },
    P3: { label: 'Priority 3', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800', description: 'Medium' },
    P4: { label: 'Priority 4', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-900/20', borderColor: 'border-slate-200 dark:border-slate-800', description: 'Low' },
};

const PrioritySelector: React.FC<PrioritySelectorProps> = ({ selectedPriority, onSelect, onChange, onClose }) => {
    const handleSelect = (priority: Priority) => {
        if (onChange) {
            onChange(priority);
        } else if (onSelect) {
            onSelect(priority);
            onClose?.();
        }
    };

    return (
        <div className="w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2">
            <div className="space-y-1">
                {(Object.keys(priorityConfig) as Priority[]).map((priority) => {
                    const config = priorityConfig[priority!];
                    const isSelected = selectedPriority === priority;

                    return (
                        <button
                            key={priority}
                            onClick={() => handleSelect(priority)}
                            className={`
                                w-full text-left px-3 py-2.5 rounded-lg transition-all
                                ${isSelected 
                                    ? `${config.bgColor} ${config.borderColor} border-2` 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-transparent'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Flag className={`w-4 h-4 ${config.color}`} />
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${config.color}`}>
                                        {config.label}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {config.description}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                                )}
                            </div>
                        </button>
                    );
                })}
                
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                
                <button
                    onClick={() => handleSelect(null)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Flag className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">No Priority</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default PrioritySelector;
export { priorityConfig };
