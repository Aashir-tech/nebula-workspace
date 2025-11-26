import React, { useState } from 'react';
import { UserCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

interface TaskAssignmentSelectorProps {
    members: Member[];
    currentAssignee?: string;
    onAssign: (userId: string | null) => void;
    onClose: () => void;
}

const TaskAssignmentSelector: React.FC<TaskAssignmentSelectorProps> = ({
    members,
    currentAssignee,
    onAssign,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (id: string) => {
        const colors = [
            'bg-blue-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-indigo-500',
            'bg-teal-500'
        ];
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    const handleSelect = (userId: string | null) => {
        onAssign(userId);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Assign to</h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Search */}
            <div className="p-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                />
            </div>

            {/* Members List */}
            <div className="max-h-64 overflow-y-auto">
                {/* Unassign Option */}
                <button
                    onClick={() => handleSelect(null)}
                    className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                        !currentAssignee ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <UserCircle2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Unassigned
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Remove assignee
                        </div>
                    </div>
                    {!currentAssignee && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    )}
                </button>

                {/* Team Members */}
                {filteredMembers.map((member) => (
                    <button
                        key={member.id}
                        onClick={() => handleSelect(member.id)}
                        className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                            currentAssignee === member.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white text-xs font-bold`}>
                            {member.avatarUrl ? (
                                <img
                                    src={member.avatarUrl}
                                    alt={member.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                getInitials(member.name)
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {member.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {member.email}
                            </div>
                        </div>
                        {currentAssignee === member.id && (
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        )}
                    </button>
                ))}

                {filteredMembers.length === 0 && searchQuery && (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No members found
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TaskAssignmentSelector;
