import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X } from 'lucide-react';

const VoiceInput: React.FC = () => {
  const { isListening, transcript, toggleMic, addTask } = useStore();
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (isListening) {
      setShowTranscript(true);
    } else if (!transcript) {
      const timer = setTimeout(() => setShowTranscript(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Transcript Bubble */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl max-w-xs mb-2 relative"
          >
            <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              {isListening ? 'Listening...' : 'Heard:'}
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {transcript || "Say 'Create task [task name]'..."}
            </div>
            {/* Pulse Effect */}
            {isListening && (
                <div className="flex gap-1 mt-2 justify-end">
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-1 bg-indigo-500 rounded-full"
                        />
                    ))}
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMic}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all relative ${
          isListening 
            ? 'bg-red-500 text-white shadow-red-500/30' 
            : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700'
        }`}
      >
        {/* Ripple Effect when listening */}
        {isListening && (
            <>
                <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-full bg-red-500 z-0"
                />
                <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                    className="absolute inset-0 rounded-full bg-red-500 z-0"
                />
            </>
        )}
        
        <div className="relative z-10">
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </div>
      </motion.button>
    </div>
  );
};

export default VoiceInput;
