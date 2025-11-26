import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface LabelPickerProps {
    selectedLabels: string[];
    onLabelsChange: (labels: string[]) => void;
    onClose: () => void;
}

const PRESET_LABELS = [
    { name: 'Work', color: 'bg-blue-500' },
    { name: 'Personal', color: 'bg-green-500' },
    { name: 'Urgent', color: 'bg-red-500' },
    { name: 'Important', color: 'bg-orange-500' },
    { name: 'Later', color: 'bg-purple-500' },
    { name: 'Ideas', color: 'bg-pink-500' },
];

const LabelPicker: React.FC<LabelPickerProps> = ({ selectedLabels, onLabelsChange, onClose }) => {
    const [newLabel, setNewLabel] = useState('');
    const [customLabels, setCustomLabels] = useState<string[]>([]);

    const handleToggleLabel = (label: string) => {
        if (selectedLabels.includes(label)) {
            onLabelsChange(selectedLabels.filter(l => l !== label));
        } else {
            onLabelsChange([...selectedLabels, label]);
        }
    };

    const handleAddCustomLabel = () => {
        if (newLabel.trim() && !customLabels.includes(newLabel.trim())) {
            const label = newLabel.trim();
            setCustomLabels([...customLabels, label]);
            onLabelsChange([...selectedLabels, label]);
            setNewLabel('');
        }
    };

    const allLabels = [...PRESET_LABELS.map(l => l.name), ...customLabels];

    return (
        <div className="w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Labels</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Preset Labels */}
            <div className="space-y-1 mb-3">
                {PRESET_LABELS.map((label) => {
                    const isSelected = selectedLabels.includes(label.name);
                    return (
                        <button
                            key={label.name}
                            onClick={() => handleToggleLabel(label.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${label.color}`} />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{label.name}</span>
                            {isSelected && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Custom Labels */}
            {customLabels.length > 0 && (
                <div className="space-y-1 mb-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                    {customLabels.map((label) => {
                        const isSelected = selectedLabels.includes(label);
                        return (
                            <button
                                key={label}
                                onClick={() => handleToggleLabel(label)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                                }`}
                            >
                                <div className="w-3 h-3 rounded-full bg-slate-400" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                                {isSelected && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Add Custom Label */}
            <div className="flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLabel()}
                    placeholder="Create label..."
                    className="flex-1 text-sm px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    onClick={handleAddCustomLabel}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                    title="Add label"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default LabelPicker;
