import React, { useState, useEffect } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import { workspaceAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceMember {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: Date;
}

interface WorkspaceMembersProps {
    workspaceId: string;
}

const WorkspaceMembers: React.FC<WorkspaceMembersProps> = ({ workspaceId }) => {
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadMembers();
    }, [workspaceId]);

    const loadMembers = async () => {
        try {
            setIsLoading(true);
            const response = await workspaceAPI.getMembers(workspaceId);
            setMembers(response.data);
        } catch (error) {
            console.error('Failed to load workspace members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberEmail.trim()) return;

        try {
            setIsAdding(true);
            // Send invitation instead of directly adding member
            await workspaceAPI.createInvitation({
                workspaceId,
                inviteeEmail: newMemberEmail.trim(),
                role: 'MEMBER'
            });
            
            setNewMemberEmail('');
            setShowAddMember(false);
            alert('Invitation sent successfully! The user will see it in their notifications.');
        } catch (error: any) {
            console.error('Failed to send invitation:', error);
            alert(error.response?.data?.error || 'Failed to send invitation');
        } finally {
            setIsAdding(false);
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-slate-400 animate-pulse" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Loading members...</span>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Team Members:
                </span>
                
                {/* Member Avatars */}
                <div className="flex -space-x-2">
                    {members.slice(0, 5).map((member) => (
                        <div
                            key={member.id}
                            className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white hover:scale-110 transition-transform cursor-pointer`}
                            title={`${member.name} (${member.role})`}
                        >
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
                    ))}
                    {members.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            +{members.length - 5}
                        </div>
                    )}
                </div>

                {/* Add Member Button */}
                <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors"
                    title="Add team member"
                >
                    <UserPlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
            </div>

            {/* Add Member Form */}
            <AnimatePresence>
                {showAddMember && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddMember}
                        className="mt-3 flex items-center gap-2"
                    >
                        <input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isAdding}
                        />
                        <button
                            type="submit"
                            disabled={isAdding || !newMemberEmail.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            {isAdding ? 'Adding...' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddMember(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkspaceMembers;
