import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertCircle, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ReminderNotifications: React.FC = () => {
    const { tasks } = useStore();
    const [activeReminders, setActiveReminders] = useState<Array<{
        taskId: string;
        taskTitle: string;
        reminderTime: Date;
        timeLeft: number;
    }>>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const upcomingReminders: typeof activeReminders = [];

            tasks.forEach(task => {
                if (task.reminder && !dismissed.has(task.id)) {
                    const reminderTime = new Date(task.reminder);
                    const timeLeft = reminderTime.getTime() - now.getTime();
                    
                    // Show notification if reminder is within 5 minutes (300000 ms)
                    if (timeLeft > 0 && timeLeft <= 300000) {
                        upcomingReminders.push({
                            taskId: task.id,
                            taskTitle: task.title,
                            reminderTime,
                            timeLeft
                        });

                        // Request browser notification permission
                        if (Notification.permission === 'granted' && timeLeft <= 60000) {
                            new Notification('Task Reminder', {
                                body: task.title,
                                icon: '/favicon.ico',
                                tag: task.id
                            });
                        }
                    }
                }
            });

            setActiveReminders(upcomingReminders);
        };

        // Check immediately
        checkReminders();

        // Check every 30 seconds
        const interval = setInterval(checkReminders, 30000);

        // Request notification permission on mount
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [tasks, dismissed]);

    const formatTimeLeft = (milliseconds: number): string => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };

    const handleDismiss = (taskId: string) => {
        setDismissed(prev => new Set(prev).add(taskId));
    };

    if (activeReminders.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
            <AnimatePresence>
                {activeReminders.map(reminder => (
                    <motion.div
                        key={reminder.taskId}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white rounded-xl shadow-2xl p-4 backdrop-blur-sm border border-white/20"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Bell className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4" />
                                    <h3 className="font-semibold text-sm">Reminder</h3>
                                </div>
                                <p className="text-sm font-medium mb-2 line-clamp-2">
                                    {reminder.taskTitle}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 opacity-80" />
                                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
                                        {formatTimeLeft(reminder.timeLeft)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDismiss(reminder.taskId)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ReminderNotifications;
