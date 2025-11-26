import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { commentAPI } from '../services/api';

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

interface CommentSectionProps {
    taskId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);

    const currentUserId = JSON.parse(localStorage.getItem('nebula_user') || '{}')?.id;

    useEffect(() => {
        loadComments();
    }, [taskId]);

    const loadComments = async () => {
        try {
            const { data } = await commentAPI.getComments(taskId);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        setLoading(true);
        try {
            const { data } = await commentAPI.createComment({
                taskId,
                content: newComment
            });
            setComments([...comments, data]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditComment = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const { data } = await commentAPI.updateComment(commentId, {
                content: editContent
            });
            setComments(comments.map(c => c.id === commentId ? data : c));
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error('Failed to edit comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await commentAPI.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* Comment List */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {comment.userName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div>
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {comment.userName}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            {formatTime(comment.createdAt)}
                                        </span>
                                    </div>
                                    {comment.userId === currentUserId && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingId(comment.id);
                                                    setEditContent(comment.content);
                                                }}
                                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editingId === comment.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="flex-1 text-sm px-2 py-1 border border-indigo-200 dark:border-indigo-800 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onKeyPress={(e) => e.key === 'Enter' && handleEditComment(comment.id)}
                                        />
                                        <button
                                            onClick={() => handleEditComment(comment.id)}
                                            className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditContent('');
                                            }}
                                            className="p-1 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    Send
                </button>
            </div>
        </div>
    );
};

export default CommentSection;
