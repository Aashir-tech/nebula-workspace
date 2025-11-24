import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Briefcase, User, Trophy, Flame } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WorkspaceType } from '../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { createWorkspace } = useStore();
    const [name, setName] = useState('');
    const [type, setType] = useState<WorkspaceType>(WorkspaceType.TEAM);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setIsLoading(true);
        try {
            await createWorkspace(name, type);
            onClose();
            setName('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Create Workspace</h2>
                                <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Workspace Name</label>
                                    <input 
                                        value={name} onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Engineering Team" autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setType(WorkspaceType.PERSONAL)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === WorkspaceType.PERSONAL ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            <User className="w-5 h-5" />
                                            <span className="text-xs font-bold">Personal</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType(WorkspaceType.TEAM)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === WorkspaceType.TEAM ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            <Briefcase className="w-5 h-5" />
                                            <span className="text-xs font-bold">Team</span>
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    type="submit" disabled={!name.trim() || isLoading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Creating...' : 'Create Workspace'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const ProfileModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { user } = useStore();
    
    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-sm bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
                            <button onClick={onClose} className="absolute top-4 right-4 p-1 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="relative -mt-12 mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-[#0f172a] p-1 mx-auto">
                                    <div className="w-full h-full rounded-xl bg-slate-700 flex items-center justify-center text-3xl font-bold text-white">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
                                    <div className="flex items-center justify-center gap-2 text-orange-500 mb-1">
                                        <Flame className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Streak</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{user.streak}</span>
                                    <span className="text-xs text-slate-500 block">Days</span>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
                                    <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
                                        <Trophy className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Rank</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">#1</span>
                                    <span className="text-xs text-slate-500 block">Global</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
