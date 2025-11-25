import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ViewMode, WorkspaceType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, PanelLeft, Search, Inbox, Calendar, Hash, 
  PlusCircle, ChevronDown, Plus, LogOut, Briefcase, User,
  Edit, Trash2, UserPlus, Users,
  Calendar1Icon,
  Calendar1
} from 'lucide-react';
import { CreateWorkspaceModal, ProfileModal, DeleteWorkspaceModal } from './Modals';
import InviteModal from './InviteModal';
import MembersModal from './MembersModal';

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onCloseMobile, isCollapsed = false, onToggleCollapse }) => {
  const { 
    user, logout, viewMode, setViewMode, 
    currentWorkspace, workspaces, switchWorkspace, 
    updateWorkspace, deleteWorkspace,
    setShowCommandPalette,
    createInvitation,
    addTask,
    showNotifications,
    setShowNotifications,
    invitations,
    tasks,
    loadWorkspaces // Added
  } = useStore();
  
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false); // Renamed to isCreateModalOpen in proposed, keeping original for now
  const [showProfile, setShowProfile] = useState(false); // Renamed to isProfileModalOpen in proposed, keeping original for now
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false); // Renamed to isMembersModalOpen in proposed, keeping original for now
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Renamed to isDeleteModalOpen in proposed, keeping original for now
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{id: string, name: string} | null>(null);

  // Calculate counts
  const inboxCount = invitations.length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime() && t.status !== 'DONE';
  }).length;

  // Mobile always full width
  const collapsed = isMobile ? false : isCollapsed;

  const handleSwitch = (id: string) => {
    switchWorkspace(id);
    setIsWorkspaceMenuOpen(false);
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const personalWorkspaces = workspaces.filter(w => w.type === WorkspaceType.PERSONAL);
  const teamWorkspaces = workspaces.filter(w => w.type === WorkspaceType.TEAM);

  const NavItem: React.FC<{ icon: any; label: string; active?: boolean; onClick: () => void; count?: number }> = ({ icon: Icon, label, active, onClick, count }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-sm ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
      <span className="flex-1 text-left truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-slate-500 dark:text-slate-600">{count}</span>
      )}
    </button>
  );

  const WorkspaceItem: React.FC<{ ws: any }> = ({ ws }) => (
    <div className="group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
      <button 
        className="flex-1 flex items-center gap-2 text-sm truncate"
        onClick={() => handleSwitch(ws.id)}
      >
        <span className={`w-2 h-2 rounded-full ${ws.id === currentWorkspace?.id ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
        {editingWorkspace === ws.id ? (
             <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={async () => {
                    if (editName.trim() && editName !== ws.name) {
                        try {
                            await updateWorkspace(ws.id, editName.trim());
                        } catch (error) {
                            console.error('Failed to update workspace name');
                        }
                    }
                    setEditingWorkspace(null);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') {
                        setEditingWorkspace(null);
                        setEditName('');
                    }
                }}
                autoFocus
                className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                onClick={(e) => e.stopPropagation()}
            />
        ) : (
            <span className={`truncate ${ws.id === currentWorkspace?.id ? 'text-indigo-600 dark:text-indigo-400 font-medium' : ''}`}>
                {ws.name}
            </span>
        )}
      </button>

      {/* Actions */}
      {ws.role === 'OWNER' && ws.type !== WorkspaceType.PERSONAL && (
        <div className="hidden group-hover:flex items-center opacity-60 hover:opacity-100">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setEditingWorkspace(ws.id);
                    setEditName(ws.name);
                }}
                className="p-1 hover:text-slate-900 dark:hover:text-white"
            >
                <Edit className="w-3 h-3" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setWorkspaceToDelete({ id: ws.id, name: ws.name });
                    setShowDeleteModal(true);
                }}
                className="p-1 hover:text-red-500 dark:hover:text-red-400"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
      )}
    </div>
  );

  return (
    <>
        <motion.aside 
            initial={false}
            animate={{ width: collapsed ? 0 : 280 }}
            className={`bg-slate-50 dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/5 flex flex-col relative z-20 h-full ${isMobile ? 'w-full' : ''} ${collapsed ? 'overflow-hidden' : ''} transition-colors duration-200`}
        >
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <button 
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
                >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {user?.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                
                <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-md transition-colors">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onToggleCollapse}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                    >
                        <PanelLeft className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Add Task Button */}
            <div className="px-3 mb-2">
                <button 
                    onClick={() => addTask('New Task')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors group"
                >
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-sm">
                        <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">Add task</span>
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
                {/* Main Nav */}
                <div className="space-y-0.5">
                    <NavItem 
                        icon={Search} 
                        label="Search" 
                        onClick={() => setShowCommandPalette(true)} 
                    />
                    <NavItem 
                        icon={Inbox} 
                        label="Inbox" 
                        active={viewMode === ViewMode.INBOX}
                        onClick={() => setViewMode(ViewMode.INBOX)}
                        count={inboxCount > 0 ? inboxCount : undefined}
                    />
                    <NavItem 
                        icon={Calendar}
                        label="Today" 
                        active={viewMode === ViewMode.TODAY} 
                        onClick={() => setViewMode(ViewMode.TODAY)} 
                        count={todayCount > 0 ? todayCount : undefined}
                    />
                    <NavItem 
                        icon={Calendar1} 
                        label="Calendar" 
                        active={viewMode === ViewMode.CALENDAR} 
                        onClick={() => setViewMode(ViewMode.CALENDAR)} 
                    />
                    <NavItem 
                        icon={Hash} 
                        label="Filters & Labels" 
                        active={viewMode === ViewMode.FILTERS}
                        onClick={() => setViewMode(ViewMode.FILTERS)} 
                    />
                </div>

                {/* My Projects */}
                <div>
                    <div className="flex items-center justify-between px-2 mb-1 group">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">My Projects</span>
                        <button 
                            onClick={() => { setShowCreateWorkspace(true); }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-0.5">
                        {personalWorkspaces.map(ws => (
                            <WorkspaceItem key={ws.id} ws={ws} />
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div>
                    <div className="flex items-center justify-between px-2 mb-1 group">
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">Team</span>
                        <div className="flex items-center transition-all">
                            <button 
                                onClick={() => setShowMembersModal(true)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white mr-1"
                                title="View Members"
                            >
                                <Users className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={() => setShowInviteModal(true)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white mr-1"
                                title="Invite Members"
                            >
                                <UserPlus className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={() => { setShowCreateWorkspace(true); }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        {teamWorkspaces.map(ws => (
                            <WorkspaceItem key={ws.id} ws={ws} />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-200 dark:border-white/5">
                 <button onClick={logout} className="flex items-center gap-2 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 text-xs px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors w-full">
                    <LogOut className="w-3 h-3" />
                    <span>Log out</span>
                </button>
            </div>
        </motion.aside>

        <CreateWorkspaceModal isOpen={showCreateWorkspace} onClose={() => setShowCreateWorkspace(false)} />
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
        
        {/* Invite Modal */}
        {showInviteModal && (
          <InviteModal
            workspaces={workspaces}
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            onInvite={createInvitation}
            onRetry={loadWorkspaces}
          />
        )}
        
        {/* Members Modal */}
        {showMembersModal && currentWorkspace && (
          <MembersModal
            workspaceId={currentWorkspace.id}
            workspaceName={currentWorkspace.name}
            currentUserRole={currentWorkspace.role}
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
          />
        )}

        {/* Delete Workspace Modal */}
        {showDeleteModal && workspaceToDelete && (
          <DeleteWorkspaceModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setWorkspaceToDelete(null);
            }}
            workspaceName={workspaceToDelete.name}
            onConfirm={async () => {
              await deleteWorkspace(workspaceToDelete.id);
            }}
          />
        )}
    </>
  );
};

export default Sidebar;
