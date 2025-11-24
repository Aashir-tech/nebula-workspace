
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Medal, Flame } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WorkspaceType, User } from '../types';
import { leaderboardAPI } from '../services/api';

interface LeaderboardUser extends User {
    tasksCompleted: number;
    trend: 'up' | 'down' | 'same';
}

const Leaderboard: React.FC = () => {
    const { currentWorkspace, user } = useStore();
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (currentWorkspace && currentWorkspace.type === WorkspaceType.TEAM) {
                try {
                    setIsLoading(true);
                    const { data } = await leaderboardAPI.getLeaderboard(currentWorkspace.id);
                    setLeaders(data);
                } catch (error) {
                    console.error('Failed to fetch leaderboard:', error);
                    // Fallback to empty array
                    setLeaders([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [currentWorkspace?.id]);

    if (currentWorkspace?.type !== WorkspaceType.TEAM) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-300">Team Feature Locked</h2>
                <p className="text-slate-500 mt-2 max-w-md">Leaderboards are only available in Team Workspaces. Switch workspace or invite a friend to unlock competitive insights.</p>
            </div>
        );
    }

    const topThree = leaders.slice(0, 3);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    Leaderboard
                </h1>
                <p className="text-slate-400 mt-2">Weekly task completion ranking for {currentWorkspace.name}.</p>
            </header>

            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
                <div className="flex items-end justify-center gap-4 mb-12">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                         <div className="w-16 h-16 rounded-full border-2 border-slate-500 bg-slate-800 mb-3 overflow-hidden">
                            <img src={topThree[1].avatarUrl} alt={topThree[1].name} className="w-full h-full object-cover" />
                         </div>
                         <div className="w-24 h-32 bg-slate-700/50 rounded-t-lg border-t border-slate-600 flex flex-col items-center justify-end p-2 relative backdrop-blur-sm">
                            <span className="text-2xl font-bold text-slate-400">2</span>
                            <div className="absolute top-2 w-8 h-1 bg-slate-500 rounded-full" />
                         </div>
                         <span className="text-sm font-bold mt-2 text-slate-300">{topThree[1].name.split(' ')[0]}</span>
                         <span className="text-xs text-slate-500">{topThree[1].tasksCompleted} pts</span>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                         <div className="absolute -mt-8">
                            <Medal className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                         </div>
                         <div className="w-20 h-20 rounded-full border-2 border-yellow-500 bg-slate-800 mb-3 overflow-hidden ring-4 ring-yellow-500/20 z-10">
                            <img src={topThree[0].avatarUrl} alt={topThree[0].name} className="w-full h-full object-cover" />
                         </div>
                         <div className="w-28 h-40 bg-gradient-to-t from-yellow-900/40 to-slate-700/50 rounded-t-lg border-t border-yellow-500/50 flex flex-col items-center justify-end p-2 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                            <span className="text-3xl font-bold text-yellow-400">1</span>
                         </div>
                         <span className="text-base font-bold mt-2 text-white">{topThree[0].name.split(' ')[0]}</span>
                         <span className="text-xs text-yellow-500 font-mono">{topThree[0].tasksCompleted} pts</span>
                    </div>

                     {/* 3rd Place */}
                     <div className="flex flex-col items-center">
                         <div className="w-16 h-16 rounded-full border-2 border-orange-700 bg-slate-800 mb-3 overflow-hidden">
                            <img src={topThree[2].avatarUrl} alt={topThree[2].name} className="w-full h-full object-cover" />
                         </div>
                         <div className="w-24 h-24 bg-slate-700/50 rounded-t-lg border-t border-orange-800 flex flex-col items-center justify-end p-2 relative backdrop-blur-sm">
                            <span className="text-2xl font-bold text-orange-700">3</span>
                         </div>
                         <span className="text-sm font-bold mt-2 text-slate-300">{topThree[2].name.split(' ')[0]}</span>
                         <span className="text-xs text-slate-500">{topThree[2].tasksCompleted} pts</span>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-xs text-slate-500 uppercase">
                            <th className="p-4 font-medium">Rank</th>
                            <th className="p-4 font-medium">Member</th>
                            <th className="p-4 font-medium text-center">Streak</th>
                            <th className="p-4 font-medium text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((leader, index) => (
                            <motion.tr 
                                key={leader.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-mono ${index < 3 ? 'text-white font-bold' : 'text-slate-500'}`}>#{index + 1}</span>
                                        {leader.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                        {leader.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                            <img src={leader.avatarUrl} alt={leader.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-sm text-slate-200 font-medium">{leader.name}</span>
                                        {leader.id === user?.id && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">You</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                                        <Flame className="w-3 h-3 fill-orange-500" />
                                        <span className="text-xs font-bold">{leader.streak}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <span className="text-sm font-mono text-white">{leader.tasksCompleted}</span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
