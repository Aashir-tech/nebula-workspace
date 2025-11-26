import React from 'react';
import { useStore } from '../context/StoreContext';
import { TaskStatus } from '../types';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileAnalyticsViewProps {
  onBack: () => void;
}

const MobileAnalyticsView: React.FC<MobileAnalyticsViewProps> = ({ onBack }) => {
  const { tasks, user } = useStore();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).getTime() < Date.now() && t.status !== TaskStatus.DONE;
  }).length;
  const inProgressTasks = totalTasks - completedTasks;

  // Mock data for the graph
  const graphData = [10, 25, 18, 30, 45, 35, 55];
  const maxVal = Math.max(...graphData);
  const points = graphData.map((val, i) => {
    const x = (i / (graphData.length - 1)) * 100;
    const y = 100 - (val / maxVal) * 80; // Leave some padding at top
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pb-20 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pt-12 bg-white dark:bg-[#0f172a] sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-900 dark:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Analytics</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-900 dark:text-white">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      <div className="px-6 space-y-6">
        {/* Total Spending (Productivity) */}
        <div>
          <span className="text-sm text-slate-500 dark:text-slate-400">Total Productivity</span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {user?.streak ? user.streak * 100 : 248967.83}
          </h2>
        </div>

        {/* Graph */}
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden h-64">
          <div className="absolute inset-0 flex items-end justify-between px-6 pb-6 opacity-10 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-full w-px bg-slate-900 dark:bg-white border-r border-dashed"></div>
            ))}
          </div>
          
          {/* Tooltip Mock */}
          <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-full bg-white dark:bg-slate-800 shadow-lg rounded-xl p-2 text-xs z-10 border border-slate-100 dark:border-slate-700">
            <span className="block font-bold text-slate-900 dark:text-white">$4,274.00</span>
            <span className="text-slate-500 dark:text-slate-400">Nov 25, 2025</span>
          </div>

          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d={`M0,100 L0,${100 - (graphData[0] / maxVal) * 80} ${points.split(' ').map((p, i) => `L${p}`).join(' ')} L100,100 Z`} 
              fill="url(#gradient)" 
            />
            <path 
              d={`M${points.split(' ').map((p, i) => i === 0 ? `M${p}` : `L${p}`).join(' ')}`} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            {/* Dots */}
            {graphData.map((val, i) => {
               const x = (i / (graphData.length - 1)) * 100;
               const y = 100 - (val / maxVal) * 80;
               return (
                 <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="#3b82f6" strokeWidth="1" />
               );
            })}
          </svg>
          
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Nov 1, 2025</span>
            <span>Nov 30, 2025</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">On Progress</span>
            <span className="block font-bold text-slate-900 dark:text-white">{inProgressTasks}</span>
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Overdue</span>
            <span className="block font-bold text-slate-900 dark:text-white">{overdueTasks}</span>
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Total</span>
            <span className="block font-bold text-slate-900 dark:text-white">{totalTasks}</span>
          </div>
        </div>

        {/* Installments (Task Breakdown) */}
        <div className="space-y-4">
            <div className="flex bg-white dark:bg-[#1e293b] p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                <button className="flex-1 py-2 text-sm font-medium rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white">
                    4 Installment
                </button>
                <button className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    6 Installment
                </button>
            </div>

            <div className="space-y-3">
                 {/* Reusing task list logic but could be filtered */}
                 {tasks.slice(0, 3).map((task, i) => (
                    <div key={task.id} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-6 h-6 text-indigo-500" />
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
                            <button className="text-xs font-bold text-sky-500 hover:text-sky-600">
                                Pay Now
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

export default MobileAnalyticsView;
