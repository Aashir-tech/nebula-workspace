import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Briefcase, User, Trophy, Flame, Trash2, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
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
                        className="relative w-full max-w-md bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Workspace</h2>
                                <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-slate-900 dark:hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Workspace Name</label>
                                    <input 
                                        value={name} onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="e.g. Engineering Team" autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setType(WorkspaceType.PERSONAL)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === WorkspaceType.PERSONAL ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                        >
                                            <User className="w-5 h-5" />
                                            <span className="text-xs font-bold">Personal</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType(WorkspaceType.TEAM)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === WorkspaceType.TEAM ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
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
    const { user, updateUserProfile, deleteUser } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    if (!user) return null;

    const handleEditStart = () => {
        setEditedName(user.name);
        setIsEditing(true);
    };

    const handleEditSave = async () => {
        if (!editedName.trim()) return;
        try {
            await updateUserProfile(editedName.trim());
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update name:', error);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteUser();
            // User will be logged out and redirected by the deleteUser action
        } catch (error) {
            console.error('Failed to delete account:', error);
            setIsDeleting(false);
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
                        className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
                            <button onClick={onClose} className="absolute top-4 right-4 p-1 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="relative -mt-12 mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#0f172a] p-1 mx-auto shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-700 dark:text-white overflow-hidden">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mb-6">
                                {isEditing ? (
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="text-xl font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                        <button onClick={handleEditSave} className="text-green-500 hover:text-green-600">
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                                        <button onClick={handleEditStart} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-center gap-2 text-orange-500 mb-1">
                                        <Flame className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Streak</span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{user.streak}</span>
                                    <span className="text-xs text-slate-500 block">Days</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
                                        <Trophy className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Rank</span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">#1</span>
                                    <span className="text-xs text-slate-500 block">Global</span>
                                </div>
                            </div>

                            {/* Delete Account Section */}
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-medium text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Account
                                </button>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-900 dark:text-red-200 text-sm mb-1">
                                                Are you absolutely sure?
                                            </h4>
                                            <p className="text-xs text-red-700 dark:text-red-300">
                                                This will permanently delete your account, all workspaces you own, and all associated data. This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete Forever'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface DeleteWorkspaceModalProps extends ModalProps {
    workspaceName: string;
    onConfirm: () => void;
}

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({ isOpen, onClose, workspaceName, onConfirm }) => {
    const [confirmName, setConfirmName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (confirmName !== workspaceName) return;
        
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
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
                        className="relative w-full max-w-md bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4 text-red-500">
                                <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-full">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Workspace</h2>
                            </div>
                            
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                This action cannot be undone. This will permanently delete the 
                                <span className="font-bold text-slate-900 dark:text-white"> {workspaceName} </span>
                                workspace and remove all associated data.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                    Please type <span className="font-mono text-slate-700 dark:text-slate-200 select-all">{workspaceName}</span> to confirm.
                                </label>
                                <input 
                                    value={confirmName} 
                                    onChange={e => setConfirmName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    placeholder={workspaceName}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button 
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={confirmName !== workspaceName || isLoading}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Workspace'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
