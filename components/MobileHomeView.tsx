import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Task, Workspace, TaskStatus } from '../types';
import { 
  Bell, 
  MoreHorizontal, 
  CreditCard, 
  Snowflake, 
  Plus, 
  Gamepad2, 
  Camera, 
  Laptop, 
  ShoppingBag,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileHomeViewProps {
  onNavigate: (view: 'HOME' | 'ANALYTICS') => void;
}

const MobileHomeView: React.FC<MobileHomeViewProps> = ({ onNavigate }) => {
  const { user, workspaces, currentWorkspace, tasks, switchWorkspace, addTask, updateTask, invitations } = useStore();
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Calculate "Balance" (Productivity Score)
  const productivityScore = user?.streak ? user.streak * 100 : 0; // Mock calculation based on streak
  
  // Calculate "Limit" (Progress) for current workspace
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const pendingTasksCount = totalTasks - completedTasks;

  // Get recent tasks (simulating transactions)
  const recentTasks = [...tasks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const handleCardChange = (index: number) => {
    setActiveCardIndex(index);
    if (workspaces[index]) {
      switchWorkspace(workspaces[index].id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pb-20 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pt-12 bg-white dark:bg-[#0f172a] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-800"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 relative text-slate-600 dark:text-slate-300">
                <Bell className="w-6 h-6" />
                {invitations.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
                )}
            </button>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Cards Carousel (Workspaces) */}
        <div className="relative w-full overflow-x-hidden py-4">
          <div 
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeCardIndex * 85}%)` }}
          >
            {workspaces.map((workspace, index) => (
              <div 
                key={workspace.id}
                onClick={() => handleCardChange(index)}
                className={`relative flex-shrink-0 w-[85%] aspect-[1.586] rounded-3xl p-6 text-white shadow-2xl transition-all duration-300 ${
                  index === activeCardIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
                }`}
                style={{
                  background: index % 2 === 0 
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                    : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                }}
              >
                {/* Card Content */}
                <div className="flex flex-col justify-between h-full relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {index % 2 === 0 ? <div className="w-8 h-5 bg-red-500/80 rounded-sm" /> : <div className="w-8 h-5 bg-yellow-500/80 rounded-sm" />}
                        <span className="font-medium opacity-90 tracking-wide text-sm">Workspace Card</span>
                    </div>
                    <span className="font-mono opacity-60 text-sm">**** {workspace.id.slice(-4)}</span>
                  </div>

                  <div className="space-y-1" onClick={() => onNavigate('ANALYTICS')}>
                    <span className="text-sm opacity-70">Workspace Limit</span>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight">${pendingTasksCount * 1000 + 43093}.00</h3>
                        {/* Mocking a currency value for visual fidelity to the design */}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs opacity-60 mb-1">Role</p>
                        <p className="font-medium">{workspace.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
              </div>
            ))}
            
            {/* Add New Workspace Card */}
            <div 
                className="relative flex-shrink-0 w-[85%] aspect-[1.586] rounded-3xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-4 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                onClick={() => {/* Trigger create workspace modal */}}
            >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium">Add New Workspace</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
            <button 
                onClick={() => addTask("New Task")}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform"
            >
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">New Task</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Snowflake className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Freeze</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <MoreHorizontal className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">More</span>
            </button>
        </div>

        {/* Payment Next (Upcoming Tasks) */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Next</h2>
            
            <div className="space-y-3">
                {recentTasks.map((task, i) => (
                    <div key={task.id} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    {i % 3 === 0 ? <Gamepad2 className="w-6 h-6 text-indigo-500" /> : 
                                     i % 3 === 1 ? <Camera className="w-6 h-6 text-orange-500" /> : 
                                     <Laptop className="w-6 h-6 text-emerald-500" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{task.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Amazon.com</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-slate-900 dark:text-white">$836.94</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Due date 18</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>1 of 4 Installment</span>
                            </div>
                            <button 
                                onClick={() => updateTask(task.id, { status: task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE })}
                                className="text-xs font-bold text-sky-500 hover:text-sky-600"
                            >
                                {task.status === TaskStatus.DONE ? 'Completed' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHomeView;
