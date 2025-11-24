import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import TaskCard from './TaskCard';
import { TaskStatus } from '../types';
import { motion } from 'motion/react';
import { Sparkles, Target, Zap, ArrowRight, Plus } from 'lucide-react';
import { generateInsights } from '../services/geminiService';

const BentoGrid: React.FC = () => {
    const { user, tasks, addTask, currentWorkspace } = useStore();
    const [insight, setInsight] = useState<any>(null);
    const [quickTitle, setQuickTitle] = useState('');

    const focusTask = tasks.find(t => t.status === TaskStatus.IN_PROGRESS) || tasks.find(t => t.status === TaskStatus.TODO);
    
    useEffect(() => {
        const fetchInsights = async () => {
            if (tasks.length > 0 && currentWorkspace) {
                const data = await generateInsights(currentWorkspace.id);
                setInsight(data);
            }
        };
        fetchInsights();
    }, [tasks.length, currentWorkspace?.id]);

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (quickTitle.trim()) {
            addTask(quickTitle);
            setQuickTitle('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-2">
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-4">
                
                {/* Welcome Card - Spans 2 */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/30 transition-colors" />
                    <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.name.split(' ')[0]}</h2>
                    <p className="text-slate-400 mb-6 relative z-10">You have {tasks.filter(t => t.status !== TaskStatus.DONE).length} active tasks today.</p>
                    
                    <div className="flex gap-4 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white">{tasks.filter(t => t.status === TaskStatus.DONE).length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Completed</span>
                        </div>
                        <div className="w-px bg-white/10 h-10" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">In Progress</span>
                        </div>
                    </div>
                </motion.div>

                {/* AI Insight Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 md:col-span-1 bg-gradient-to-br from-emerald-900/20 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between"
                >
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Productivity Pulse</span>
                    </div>
                    {insight ? (
                        <>
                            <div className="text-3xl font-bold text-white">{insight.score || 85}%</div>
                            <p className="text-sm text-slate-400 leading-snug mt-2">{insight.content}</p>
                        </>
                    ) : (
                        <div className="animate-pulse space-y-2">
                            <div className="h-8 bg-white/10 rounded w-1/3"></div>
                            <div className="h-4 bg-white/5 rounded w-full"></div>
                            <div className="h-4 bg-white/5 rounded w-2/3"></div>
                        </div>
                    )}
                </motion.div>

                {/* Quick Capture */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 md:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col"
                >
                    <div className="flex items-center gap-2 text-blue-400 mb-4">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Quick Capture</span>
                    </div>
                    <form onSubmit={handleQuickAdd} className="flex-1 flex flex-col gap-2">
                        <textarea 
                            value={quickTitle}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleQuickAdd(e);
                                }
                            }}
                            placeholder="Type a task and hit Enter..."
                            className="w-full h-full bg-transparent resize-none focus:outline-none text-sm text-white placeholder-slate-600"
                        />
                        <button 
                            type="submit"
                            disabled={!quickTitle.trim()}
                            className="self-end p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </motion.div>

                {/* Today's Focus - Spans 2 vertical if needed, but here horizontal */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-1 md:col-span-2 row-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Target className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Today's Focus</span>
                        </div>
                        <span className="text-xs text-slate-500">Top Priority</span>
                    </div>
                    
                    {focusTask ? (
                         <div className="transform scale-100 origin-top-left">
                            <TaskCard task={focusTask} />
                         </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                            <p>No active tasks.</p>
                            <button onClick={() => addTask("New Priority Task")} className="mt-2 text-blue-400 text-sm hover:underline">Create one</button>
                        </div>
                    )}
                </motion.div>

                {/* Mini List */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-1 md:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-hidden"
                >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Up Next</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {tasks.filter(t => t.id !== focusTask?.id && t.status !== TaskStatus.DONE).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                <span className="text-sm text-slate-300 truncate">{task.title}</span>
                                <span className="text-[10px] px-2 py-1 rounded bg-black/40 text-slate-500">{task.status}</span>
                            </div>
                        ))}
                         {tasks.filter(t => t.id !== focusTask?.id && t.status !== TaskStatus.DONE).length === 0 && (
                            <p className="text-slate-600 text-sm italic">You're all caught up!</p>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default BentoGrid;