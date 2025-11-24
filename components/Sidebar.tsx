import React, { useState} from 'react';
import { useStore } from '../context/StoreContext';
import { ViewMode, WorkspaceType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Layout, List, Grid, Trophy, Settings, 
  ChevronDown, Plus, LogOut, Command, Briefcase, User, 
  HomeIcon
} from 'lucide-react';
import { CreateWorkspaceModal, ProfileModal } from './Modals';


interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onCloseMobile }) => {
  const { 
    user, logout, viewMode, setViewMode, 
    currentWorkspace, workspaces, switchWorkspace, 
    setShowCommandPalette 
  } = useStore();
  
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Mobile always full width
  const collapsed = isMobile ? false : isCollapsed;

  const handleSwitch = (id: string) => {
    switchWorkspace(id);
    setIsWorkspaceMenuOpen(false);
  };

  const navItemClass = (active: boolean) => `
    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all 
    ${active 
        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }
    ${collapsed ? 'justify-center' : ''}
  `;

  return (
    <>
        <motion.aside 
            initial={false}
            animate={{ width: collapsed ? 80 : 256 }}
            className={`bg-[#0f172a] border-r border-white/5 flex flex-col relative z-20 h-full ${isMobile ? 'w-full' : ''}`}
        >
            {/* Header / Workspace Switcher */}
            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <button 
                        onClick={() => !collapsed && setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                        className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
                            {currentWorkspace?.name.charAt(0)}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 text-left overflow-hidden">
                                <h3 className="text-sm font-medium text-white truncate">{currentWorkspace?.name}</h3>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{currentWorkspace?.role}</span>
                            </div>
                        )}
                        {!collapsed && <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isWorkspaceMenuOpen ? 'rotate-180' : ''}`} />}
                    </button>

                    {/* Workspace Dropdown */}
                    <AnimatePresence>
                        {isWorkspaceMenuOpen && !collapsed && (
                            <motion.div 
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                            >
                                <div className="p-1">
                                    <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Switch Workspace</div>
                                    {workspaces.map(ws => (
                                        <button 
                                            key={ws.id}
                                            onClick={() => handleSwitch(ws.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${ws.id === currentWorkspace?.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                                        >
                                            {ws.type === WorkspaceType.PERSONAL ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                            {ws.name}
                                        </button>
                                    ))}
                                    <div className="h-px bg-white/5 my-1" />
                                    <button 
                                        onClick={() => { setShowCreateWorkspace(true); setIsWorkspaceMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" /> Create Workspace
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
               <button 
                    onClick={() => setViewMode(ViewMode.HOME)}
                className={navItemClass(viewMode === ViewMode.HOME)}
                >
                <HomeIcon className="w-5 h-5" />
                {!collapsed && <span>Home</span>}
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.BOARD)}
                    className={navItemClass(viewMode === ViewMode.BOARD)}
                >
                    <Layout className="w-5 h-5" />
                    {!collapsed && <span>Kanban Board</span>}
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.LIST)}
                    className={navItemClass(viewMode === ViewMode.LIST)}
                >
                    <List className="w-5 h-5" />
                    {!collapsed && <span>List View</span>}
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.GRID)}
                    className={navItemClass(viewMode === ViewMode.GRID)}
                >
                    <Grid className="w-5 h-5" />
                    {!collapsed && <span>Gallery View</span>}
                </button>
                
                <div className="my-4 h-px bg-white/5 mx-2" />
                
                <button 
                    onClick={() => setViewMode(ViewMode.LEADERBOARD)}
                    className={navItemClass(viewMode === ViewMode.LEADERBOARD)}
                >
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {!collapsed && <span>Leaderboard</span>}
                </button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-2">
                    <button 
                        onClick={() => setShowCommandPalette(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-400 hover:border-slate-600 transition-colors"
                    >
                        <Command className="w-3 h-3" />
                        <span>Search</span>
                    </button>
                
                <div className="flex items-center justify-between mt-4">
                     <button 
                        onClick={() => setShowProfile(true)}
                        className={`flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 ${collapsed ? 'mx-auto' : ''}`}
                     >
                        <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name.charAt(0)}
                        </div>
                        {!collapsed && <span className="text-sm truncate max-w-[80px]">{user?.name}</span>}
                     </button>
                    
                    {!collapsed && (
                        <button onClick={logout} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>

        <CreateWorkspaceModal isOpen={showCreateWorkspace} onClose={() => setShowCreateWorkspace(false)} />
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Sidebar;
