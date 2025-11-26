import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Kanban, List, Users, LayoutGrid, Calendar, Plus, ChevronDown, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import InlineTaskInput from './InlineTaskInput';
import TaskCard from './TaskCard';
import { BoardView } from './Views';
import WorkspaceMembers from './WorkspaceMembers';
import WorkspaceCalendar from './WorkspaceCalendar';
import LeaveWorkspaceModal from './LeaveWorkspaceModal';

interface WorkspaceViewProps {
    workspaceId: string;
}

type WorkspaceViewMode = 'kanban' | 'list' | 'grid' | 'calendar';

const WorkspaceView: React.FC<WorkspaceViewProps> = ({ workspaceId }) => {
    const { tasks, workspaces, addTask, leaveWorkspace } = useStore();
    const [currentView, setCurrentView] = useState<WorkspaceViewMode>('list');
    const [isAdding, setIsAdding] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isLeavingWorkspace, setIsLeavingWorkspace] = useState(false);
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    const workspaceTasks = tasks.filter(t => t.workspaceId === workspaceId && !t.archived);
    
    const handleLeaveWorkspace = async () => {
        if (!workspace) return;
        
        setIsLeavingWorkspace(true);
        try {
            await leaveWorkspace(workspaceId);
            setShowLeaveModal(false);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to leave workspace');
        } finally {
            setIsLeavingWorkspace(false);
        }
    };
    
    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">Workspace not found</p>
            </div>
        );
    }

    const viewIcons = {
        LIST: List,
        KANBAN: Kanban,
        GRID: LayoutGrid,
        CALENDAR: Calendar
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Workspace Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {workspace.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {workspace.name}
                                {workspace.type === 'TEAM' && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                                        Team
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {workspaceTasks.length} {workspaceTasks.length === 1 ? 'task' : 'tasks'}
                                {workspace.type === 'TEAM' && ' · Shared workspace'}
                            </p>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {(['LIST', 'KANBAN', 'GRID', 'CALENDAR'] as (keyof typeof viewIcons)[]).map((view) => {
                            const Icon = viewIcons[view];
                            return (
                                <button
                                    key={view}
                                    onClick={() => setCurrentView(view.toLowerCase() as WorkspaceViewMode)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        currentView === view.toLowerCase()
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 inline mr-1" />
                                    {view.charAt(0) + view.slice(1).toLowerCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Team Members */}
                {workspace?.type === 'TEAM' && (
                    <div className="flex items-center justify-between">
                        <WorkspaceMembers workspaceId={workspaceId} />
                        
                        {/* Leave Workspace Button (for non-owners) */}
                        {workspace.role !== 'OWNER' && (
                            <button
                                onClick={() => setShowLeaveModal(true)}
                                className="ml-4 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                title="Leave workspace"
                            >
                                <LogOut className="w-4 h-4" />
                                Leave
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div>
                {currentView === 'list' && (
                    <LayoutGroup id={`workspace-${workspaceId}`}>
                        <div className="space-y-2">
                            {workspaceTasks.length === 0 && !isAdding ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                                        No tasks yet. Add your first task!
                                    </p>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Add Task
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <AnimatePresence mode="popLayout">
                                        {workspaceTasks.map(task => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                    </AnimatePresence>
                                    
                                    {!isAdding && (
                                        <button 
                                            onClick={() => setIsAdding(true)}
                                            className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Add task</span>
                                        </button>
                                    )}
                                </>
                            )}
                            
                            {isAdding && (
                                <InlineTaskInput 
                                    onAdd={(title, description, date, priority, reminder, customReminderDate, labels, subtasks, selectedWorkspaceId) => {
                                        // Convert reminder string to actual Date
                                        let reminderDate: Date | null = null;
                                        
                                        if (customReminderDate) {
                                            reminderDate = customReminderDate;
                                        } else if (reminder && date) {
                                            // Calculate reminder time based on due date
                                            const dueDate = new Date(date);
                                            switch (reminder) {
                                                case '15min':
                                                    reminderDate = new Date(dueDate.getTime() - 15 * 60000);
                                                    break;
                                                case '30min':
                                                    reminderDate = new Date(dueDate.getTime() - 30 * 60000);
                                                    break;
                                                case '1hour':
                                                    reminderDate = new Date(dueDate.getTime() - 60 * 60000);
                                                    break;
                                                case '2hours':
                                                    reminderDate = new Date(dueDate.getTime() - 120 * 60000);
                                                    break;
                                            }
                                        } else if (reminder) {
                                            // Set reminder from now
                                            const now = new Date();
                                            switch (reminder) {
                                                case '15min':
                                                    reminderDate = new Date(now.getTime() + 15 * 60000);
                                                    break;
                                                case '30min':
                                                    reminderDate = new Date(now.getTime() + 30 * 60000);
                                                    break;
                                                case '1hour':
                                                    reminderDate = new Date(now.getTime() + 60 * 60000);
                                                    break;
                                                case '2hours':
                                                    reminderDate = new Date(now.getTime() + 120 * 60000);
                                                    break;
                                            }
                                        }
                                        
                                        // Pass workspaceId to ensure task is created in correct workspace
                                        addTask(title, priority, date, labels, subtasks, workspaceId, reminderDate, undefined);
                                        setIsAdding(false);
                                    }}
                                    onCancel={() => setIsAdding(false)}
                                />
                            )}
                        </div>
                    </LayoutGroup>
                )}

                {currentView === 'kanban' && (
                    <BoardView />
                )}

                {currentView === 'calendar' && workspace && (
                    <WorkspaceCalendar workspaceId={workspace.id} />
                )}
            </div>

            {/* Leave Workspace Modal */}
            <LeaveWorkspaceModal
                isOpen={showLeaveModal}
                workspaceName={workspace.name}
                onConfirm={handleLeaveWorkspace}
                onCancel={() => setShowLeaveModal(false)}
                isLoading={isLeavingWorkspace}
            />
        </div>
    );
};

export default WorkspaceView;
