import React from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Bell, Mail } from 'lucide-react';

interface NotificationPopoverProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
    const { invitations, acceptInvitation, rejectInvitation } = useStore();

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-16 right-4 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </h3>
                    {invitations.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {invitations.length}
                        </span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {invitations.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <Bell className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {invitations.map((invitation) => (
                                <div key={invitation.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-900 dark:text-white mb-1">
                                                <span className="font-medium">{invitation.inviterName}</span> invited you to join <span className="font-medium">{invitation.workspaceName}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                Role: {invitation.role}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => acceptInvitation(invitation.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => rejectInvitation(invitation.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default NotificationPopover;
