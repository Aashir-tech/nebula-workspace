import React, { useState } from 'react';
import { X, Mail, Check, AlertCircle } from 'lucide-react';
import { Invitation } from '../types';

interface NotificationBarProps {
  invitations: Invitation[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onClose: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ 
  invitations, 
  onAccept, 
  onReject, 
  onClose 
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!invitations || invitations.length === 0) return null;

  const currentInvitation = invitations[currentIndex];

  const handleAccept = async () => {
    setProcessingId(currentInvitation.id);
    try {
      await onAccept(currentInvitation.id);
      if (currentIndex < invitations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    setProcessingId(currentInvitation.id);
    try {
      await onReject(currentInvitation.id);
      if (currentIndex < invitations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to reject invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm sm:text-base truncate">
                <span className="font-semibold">{currentInvitation.invitedBy.name}</span> invited you to{' '}
                <span className="font-semibold">{currentInvitation.workspace.name}</span>
              </p>
              <p className="text-white/80 text-xs sm:text-sm">
                as {currentInvitation.role === 'ADMIN' ? 'an Admin' : 'a Member'}
                {invitations.length > 1 && (
                  <span className="ml-2">
                    ({currentIndex + 1} of {invitations.length})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleReject}
              disabled={!!processingId}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!!processingId}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-white/90 text-indigo-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium shadow-lg"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={onClose}
              className="ml-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;
