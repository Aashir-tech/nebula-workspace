
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ViewMode } from '../types';
import { BoardView, ListView, GridView, OverviewView } from './Views';
import Leaderboard from './Leaderboard';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { ProfileModal } from './Modals';
import { 
  Menu, Plus, Mic, MessageSquarePlus, Send, Search, 
  Flame, Bell, Settings, LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Dashboard: React.FC = () => {
  const { 
    viewMode, currentWorkspace, user, 
    addTask, isListening, toggleMic, transcript,
    setShowCommandPalette 
  } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const renderView = () => {
    switch (viewMode) {
      case ViewMode.HOME:
        return <OverviewView />;
      case ViewMode.OVERVIEW: return <OverviewView />;
      case ViewMode.BOARD: return <BoardView />;
      case ViewMode.LIST: return <ListView />;
      case ViewMode.GRID: return <GridView />;
      case ViewMode.LEADERBOARD: return <Leaderboard />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      <CommandPalette />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
          <Sidebar />
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
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative">
        {/* Ambient Background - Nebula Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10 bg-[#0f172a]/80 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-white tracking-tight hidden sm:block">
                    {viewMode === ViewMode.LEADERBOARD ? 'Team Rankings' : 'My Workspace'}
                </h1>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
                {/* Search Bar - Moved from Sidebar */}
                <div className="relative hidden md:block w-64 lg:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                        placeholder="Search tasks... (Cmd+K)"
                        onClick={() => setShowCommandPalette(true)}
                        readOnly
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-xs text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
                    </div>
                </div>

                {/* Streak Counter */}
                <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
                    <Flame className={`w-4 h-4 text-orange-500 ${user?.streak && user.streak > 0 ? 'fill-orange-500 animate-pulse' : ''}`} />
                    <span className="text-sm font-bold text-orange-400">{user?.streak || 0}</span>
                </div>

                <div className="h-6 w-px bg-white/10 mx-2" />
                
                <button 
                    onClick={() => setShowProfile(true)}
                    className="w-8 h-8 rounded-full border-2 border-indigo-500/50 hover:border-indigo-400 shadow-sm transition-all hover:scale-105 overflow-hidden"
                >
                    <img 
                        src={user?.avatarUrl} 
                        alt="User" 
                        className="w-full h-full object-cover" 
                    />
                </button>
            </div>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-hidden relative z-0">
          <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="h-full max-w-7xl mx-auto"
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Global Chat Interface for Task Creation */}
        <div className="absolute bottom-8 right-8 z-40 flex items-center gap-3">
            {/* Voice Transcript Display */}
            <AnimatePresence>
                {isListening && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-indigo-300"
                    >
                        {transcript}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Input Popover */}
            <AnimatePresence>
                {showChatInput && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-20 right-0 w-80 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquarePlus className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-semibold text-white">Quick Add Task</span>
                            </div>
                            <button onClick={() => setShowChatInput(false)} className="text-slate-500 hover:text-white">
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (chatMessage.trim()) {
                                    addTask(chatMessage);
                                    setChatMessage('');
                                    setShowChatInput(false);
                                }
                            }} className="flex gap-2">
                                <input 
                                    autoFocus
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Type your task here..."
                                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!chatMessage.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl hover:shadow-lg hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice Input Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMic}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-white/10 transition-all relative overflow-hidden ${isListening ? 'bg-red-500 shadow-red-500/40' : 'bg-purple-600 shadow-purple-600/40'}`}
            >
                <div className={`absolute inset-0 bg-white/20 rounded-full animate-ping ${isListening ? 'block' : 'hidden'}`} />
                <Mic className="w-6 h-6 text-white relative z-10" />
            </motion.button>

            {/* Chat Input Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChatInput(!showChatInput)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-white/10 transition-all relative overflow-hidden ${showChatInput ? 'bg-indigo-500 shadow-indigo-500/40' : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-600/40'}`}
            >
                <MessageSquarePlus className="w-6 h-6 text-white relative z-10" />
            </motion.button>
        </div>

      </main>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
};

export default Dashboard;
