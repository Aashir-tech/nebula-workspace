import React, {useState, useEffect } from 'react';
import { X, Users, Crown, Shield, User, Trash2 } from 'lucide-react';
import { workspaceAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

interface MembersModalProps {
  workspaceId: string;
  workspaceName: string;
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  isOpen: boolean;
  onClose: () => void;
}

const MembersModal: React.FC<MembersModalProps> = ({
  workspaceId,
  workspaceName,
  currentUserRole,
  isOpen,
  onClose
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && workspaceId) {
      loadMembers();
    }
  }, [isOpen, workspaceId]);

  const loadMembers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await workspaceAPI.getMembers(workspaceId);
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      await workspaceAPI.removeMember(workspaceId, userId);
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20';
      case 'ADMIN':
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/30';
    }
  };

  const canRemoveMember = (memberRole: string) => {
    if (memberRole === 'OWNER') return false;
    return currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Members</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{workspaceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-slate-300 dark:hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 overflow-hidden bg-slate-200 dark:bg-slate-800">
                        {member.avatarUrl ? (
                            <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-400">
                                {member.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">{member.name}</h3>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span>{member.role}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {canRemoveMember(member.role) && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No members found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MembersModal;
