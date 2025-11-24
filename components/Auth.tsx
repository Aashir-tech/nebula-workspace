import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, User, Chrome } from 'lucide-react';

const Auth: React.FC = () => {
  const { login, register, isLoading } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name) {
          setError('Name is required');
          return;
        }
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const backendURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:8299' 
      : 'https://nebula-workspace-backend.vercel.app';
    window.location.href = `${backendURL}/api/auth/google`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        animate={{ 
            x: mousePos.x * -20, 
            y: mousePos.y * -20,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ 
            x: mousePos.x * 30, 
            y: mousePos.y * 30,
        }}
        transition={{ type: 'spring', stiffness: 40, damping: 25 }}
      />

      {/* Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform duration-300">
                <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Join Nebula'}
            </h1>
            <p className="text-slate-400 mt-3 text-lg font-light">
              {mode === 'login' ? 'Enter your credentials to access.' : 'Start your productivity journey today.'}
            </p>
        </div>

        <div className="space-y-4 mb-6">
            <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white text-slate-900 rounded-xl py-3 font-semibold flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors"
            >
                <Chrome className="w-5 h-5 text-blue-600" />
                Continue with Google
            </button>
            
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                </div>
                <span className="relative bg-[#0f172a]/50 px-4 text-sm text-slate-500 uppercase tracking-wider backdrop-blur-sm">Or continue with</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                  <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                      <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                          placeholder="Alex Architect"
                          required
                      />
                  </div>
              </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                        placeholder="name@example.com"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        minLength={6}
                        required
                    />
                </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;