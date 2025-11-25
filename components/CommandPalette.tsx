import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Layout, Grid, Moon, Sun, ArrowRight, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ViewMode } from '../types';

const CommandPalette: React.FC = () => {
    const { showCommandPalette, setShowCommandPalette, addTask, setViewMode } = useStore();
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(!showCommandPalette);
            }
            if (e.key === 'Escape') {
                setShowCommandPalette(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showCommandPalette, setShowCommandPalette]);

    if (!showCommandPalette) return null;

    const commands = [
        { id: 'new', label: 'Create new task', icon: <Plus className="w-4 h-4" />, action: () => { addTask('New Task'); setShowCommandPalette(false); } },
        { id: 'board', label: 'Go to Board View', icon: <Layout className="w-4 h-4" />, action: () => { setViewMode(ViewMode.BOARD); setShowCommandPalette(false); } },
        { id: 'overview', label: 'Go to Overview', icon: <Grid className="w-4 h-4" />, action: () => { setViewMode(ViewMode.OVERVIEW); setShowCommandPalette(false); } },
        { id: 'list', label: 'Go to List View', icon: <Grid className="w-4 h-4" />, action: () => { setViewMode(ViewMode.LIST); setShowCommandPalette(false); } },
    ];

    const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCommandPalette(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    className="relative w-full max-w-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input 
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white px-4 placeholder-slate-400 dark:placeholder-slate-500 h-8"
                        />
                        <button onClick={() => setShowCommandPalette(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto py-2">
                        {filteredCommands.length > 0 ? (
                            filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors ${index === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                        {cmd.icon}
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{cmd.label}</span>
                                    {index === 0 && <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-500">
                                No commands found.
                            </div>
                        )}
                    </div>
                    
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                        <span>Antigravity Palette</span>
                        <div className="flex gap-2">
                            <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Select</span>
                            <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Esc</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CommandPalette;