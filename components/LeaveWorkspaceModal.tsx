import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LeaveWorkspaceModalProps {
  isOpen: boolean;
  workspaceName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LeaveWorkspaceModal: React.FC<LeaveWorkspaceModalProps> = ({
  isOpen,
  workspaceName,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Leave Workspace
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Are you sure you want to leave{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      "{workspaceName}"
                    </span>
                    ?
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-medium">You will lose access to:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                          <li>All tasks and projects in this workspace</li>
                          <li>Shared files and collaboration features</li>
                          <li>Team discussions and updates</li>
                        </ul>
                        <p className="font-medium mt-3">
                          You'll need to be re-invited to access this workspace again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Leave Workspace
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LeaveWorkspaceModal;
