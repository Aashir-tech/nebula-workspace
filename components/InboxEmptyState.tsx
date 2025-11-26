import React from 'react';
import { Plus } from 'lucide-react';

interface InboxEmptyStateProps {
    onAddClick: () => void;
}

const InboxEmptyState: React.FC<InboxEmptyStateProps> = ({ onAddClick }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-6 relative">
                {/* Placeholder for the illustration - using a styled div for now */}
                <div className="w-48 h-48 bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/5 rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="w-32 h-24 bg-amber-200 dark:bg-amber-700/40 rounded-lg shadow-inner transform translate-y-4 flex items-center justify-center">
                        <div className="w-24 h-1 bg-amber-300 dark:bg-amber-600/40 rounded-full mb-12"></div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-10 right-10 text-amber-400 text-2xl">✨</div>
                    <div className="absolute bottom-12 left-8 text-emerald-400 text-xl">🌿</div>
                </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Capture now, plan later
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8 text-sm leading-relaxed">
                Inbox is your go-to spot for quick task entry. Clear your mind now, organize when you're ready.
            </p>
            
            <button
                onClick={onAddClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            >
                <Plus className="w-4 h-4" />
                Add task
            </button>
        </div>
    );
};

export default InboxEmptyState;
