import React from 'react';
import { FolderOpen, Check } from 'lucide-react';
import { Workspace } from '../types';

interface MoveToSelectorProps {
    workspaces: Workspace[];
    currentWorkspaceId: string;
    onSelect: (workspaceId: string) => void;
    onClose: () => void;
}

const MoveToSelector: React.FC<MoveToSelectorProps> = ({ 
    workspaces, 
    currentWorkspaceId,
    onSelect, 
    onClose 
}) => {
    const handleSelect = (workspaceId: string) => {
        if (workspaceId !== currentWorkspaceId) {
            onSelect(workspaceId);
            onClose();
        }
    };

    return (
        <div className="w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2">
            <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Move to Workspace
                </h3>
            </div>
            
            <div className="space-y-1 py-2 max-h-80 overflow-y-auto">
                {workspaces.map((workspace) => {
                    const isCurrent = workspace.id === currentWorkspaceId;
                    
                    return (
                        <button
                            key={workspace.id}
                            onClick={() => handleSelect(workspace.id)}
                            disabled={isCurrent}
                            className={`
                                w-full text-left px-3 py-2.5 rounded-lg transition-all
                                ${isCurrent
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 cursor-not-allowed' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-transparent cursor-pointer'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <FolderOpen className={`w-4 h-4 ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium truncate ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {workspace.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                        {workspace.type.toLowerCase()} • {workspace.role.toLowerCase()}
                                    </div>
                                </div>
                                {isCurrent && (
                                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {workspaces.length === 1 && (
                <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    No other workspaces available
                </div>
            )}
        </div>
    );
};

export default MoveToSelector;
