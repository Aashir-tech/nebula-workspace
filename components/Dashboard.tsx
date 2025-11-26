import React, { useState, useEffect , useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ViewMode } from '../types';
import { OverviewView, BoardView, ListView, GridView, InboxView, TodayView, FiltersView, CalendarView } from './Views';
import CompletedView from './CompletedView';
import Leaderboard from './Leaderboard';
import TimeBasedGreeting from './TimeBasedGreeting';
import WorkspaceView from './WorkspaceView';
import BentoGrid from './BentoGrid';
import NotificationPanel from './NotificationPanel';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { ProfileModal } from './Modals';
import InviteModal from './InviteModal';
import NotificationBar from './NotificationBar';
import NotificationPopover from './NotificationPopover';
import { 
  Menu, Search, Flame, Bell, UserPlus, SlidersHorizontal, 
  Layout, List, Grid, Trophy, Home, Sun, Moon, PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Dashboard: React.FC = () => {
  const { 
    viewMode, setViewMode, currentWorkspace, workspaces, user, 
    addTask, invitations, createInvitation, acceptInvitation, rejectInvitation,
    setShowCommandPalette,
    showNotifications,
    setShowNotifications,
    loadWorkspaces,
    switchWorkspace, // Added from diff
    logout // Added from diff
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Added from diff
  const [showBentoGrid, setShowBentoGrid] = useState(false); // Added from diff
  const profileMenuRef = useRef<HTMLDivElement>(null); // Added from diff

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    // Check system preference or local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (showInviteModal && workspaces.length === 0) {
      loadWorkspaces();
    }
  }, [showInviteModal, workspaces.length]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const renderView = () => {
    switch (viewMode) {
      case ViewMode.HOME: return <OverviewView />;
      case ViewMode.OVERVIEW: return <OverviewView />;
      case ViewMode.BOARD: return <BoardView />;
      case ViewMode.LIST: return <ListView />;
      case ViewMode.GRID: return <GridView />;
      case ViewMode.LEADERBOARD: return <Leaderboard />;
      case ViewMode.INBOX: return <InboxView />;
      case ViewMode.COMPLETED: return <CompletedView />;
      case ViewMode.TODAY: return <TodayView />;
      case ViewMode.FILTERS: return <FiltersView />;
      case ViewMode.CALENDAR: return <CalendarView />;
      case ViewMode.WORKSPACE: 
        return selectedWorkspaceId ? <WorkspaceView workspaceId={selectedWorkspaceId} /> : <InboxView />;
      default: return <OverviewView />;
    }
  };

  const viewOptions = [
    { mode: ViewMode.HOME, label: 'Home', icon: Home },
    { mode: ViewMode.BOARD, label: 'Board', icon: Layout },
    { mode: ViewMode.LIST, label: 'List', icon: List },
    { mode: ViewMode.GRID, label: 'Gallery', icon: Grid },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      <CommandPalette />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full border-r border-slate-200 dark:border-white/5">
          <Sidebar 
            collapsed={isSidebarCollapsed} 
            onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            onWorkspaceClick={(workspaceId) => {
              setSelectedWorkspaceId(workspaceId);
              setViewMode(ViewMode.WORKSPACE);
            }}
          />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                />
                <motion.div
                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
                >
                    <Sidebar isMobile onCloseMobile={() => setIsMobileMenuOpen(false)} />
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f172a] relative transition-colors duration-200">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6 z-10 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl transition-colors duration-200">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <Menu className="w-5 h-5" />
                </button>
                {isSidebarCollapsed && (
                    <button 
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="hidden md:block p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        title="Open Sidebar"
                    >
                        <PanelLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {viewMode === ViewMode.LEADERBOARD ? 'Team Rankings' : (currentWorkspace?.name || 'My Workspace')}
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* View Switcher */}
                <div className="relative">
                    <button 
                        onClick={() => setShowViewMenu(!showViewMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                    </button>

                    <AnimatePresence>
                        {showViewMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowViewMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    <div className="p-1">
                                        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Layout</div>
                                        {viewOptions.map(option => (
                                            <button
                                                key={option.mode}
                                                onClick={() => {
                                                    setViewMode(option.mode);
                                                    setShowViewMenu(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    viewMode === option.mode 
                                                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' 
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                <option.icon className="w-4 h-4" />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notifications Bell */}
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 transition-colors ${
                    showNotifications 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {invitations.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-[#0f172a]" />
                  )}
                </button>
            </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          <div className="p-4 md:p-6">
            {/* Time-Based Greeting */}
            <TimeBasedGreeting userName={user?.name || 'there'} />
            
            {/* View Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Notification Popover */}
      <NotificationPopover 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />



      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          workspaces={workspaces}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={createInvitation}
        />
      )}


      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
};

export default Dashboard;
