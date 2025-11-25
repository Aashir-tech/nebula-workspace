import React from 'react';
import { motion } from 'motion/react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#050b14] flex items-center justify-center z-50 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#0f172a] to-[#050b14] opacity-80" />
      
      {/* Central Orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full border border-indigo-500/30 border-t-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        />
        
        {/* Outer Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute w-48 h-48 rounded-full border border-cyan-500/20 border-b-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        />

        {/* Inner Pulsing Core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-full blur-md shadow-2xl shadow-indigo-500/50"
        />
        
        {/* Core Highlight */}
        <div className="absolute w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm" />
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute mt-40 text-center"
      >
        <h2 className="text-xl font-medium text-white tracking-[0.2em] uppercase">Nebula</h2>
        <p className="text-xs text-slate-500 mt-2 tracking-widest">Initializing Workspace</p>
      </motion.div>
    </div>
  );
};

export default Loader;
