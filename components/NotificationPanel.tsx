import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { invitationAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

interface Invitation {
  id: string;
  workspace: {
    id: string;
    name: string;
    type: string;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  createdAt: string;
}

const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await invitationAPI.getMyInvitations();
      setInvitations(response.data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await invitationAPI.accept(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      // Reload page to show new workspace
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      alert(error.response?.data?.error || 'Failed to accept invitation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await invitationAPI.reject(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (error: any) {
      console.error('Failed to reject invitation:', error);
      alert(error.response?.data?.error || 'Failed to reject invitation');
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {invitations.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Workspace Invitations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">
                  Loading...
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No pending invitations
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {invitation.workspace.name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Invited by {invitation.invitedBy.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            Role: <span className="font-medium">{invitation.role}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(invitation.id)}
                            className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(invitation.id)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
