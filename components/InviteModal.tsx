import React, { useState, useEffect } from 'react';
import { X, Mail, UserPlus, AlertCircle, Briefcase, ChevronDown } from 'lucide-react';
import { Workspace } from '../types';

interface InviteModalProps {
  workspaces: Workspace[];
  isOpen: boolean;
  onClose: () => void;
  onInvite: (workspaceId: string, email: string, role: 'MEMBER' | 'ADMIN') => Promise<void>;
  onRetry?: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ 
  workspaces = [],
  isOpen, 
  onClose, 
  onInvite,
  onRetry
}: InviteModalProps) => {
  const [email, setEmail] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Filter to only show TEAM workspaces
  const teamWorkspaces = workspaces.filter(ws => ws.type === 'TEAM');

  useEffect(() => {
    if (isOpen && teamWorkspaces.length > 0) {
      // Default to first team workspace if none selected
      if (!selectedWorkspaceId) {
        setSelectedWorkspaceId(teamWorkspaces[0].id);
      }
    }
  }, [isOpen, teamWorkspaces]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (teamWorkspaces.length === 0) {
        setError('Please create a team workspace first to invite members');
        return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!selectedWorkspaceId) {
      setError('Please select a workspace');
      return;
    }

    setIsLoading(true);
    try {
      console.log('InviteModal calling onInvite with:', { workspaceId: selectedWorkspaceId, email, role: 'MEMBER' });
      await onInvite(selectedWorkspaceId, email, 'MEMBER');
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const hasWorkspaces = teamWorkspaces.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite to Workspace</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add members to your team</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            {/* Empty State Error */}
            {!hasWorkspaces ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Team Workspaces Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Please create a team workspace first to invite members.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                            >
                                Refresh Workspaces
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Workspace Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Select Workspace
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <select
                            value={selectedWorkspaceId}
                            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                            disabled={isLoading}
                        >
                            {teamWorkspaces.map(ws => (
                                <option key={ws.id} value={ws.id}>
                                    {ws.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                    </label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        disabled={isLoading}
                        autoFocus
                    />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                    <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-600 dark:text-green-400">Invitation sent successfully!</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium"
                    disabled={isLoading}
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Sending...' : 'Send Invite'}
                    </button>
                </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
