import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identifier.trim() || !password) {
      setLocalError('Please enter your email/username and password');
      return;
    }

    setLoading(true);
    const result = await login({ identifier: identifier.trim(), password });
    setLoading(false);

    if (result.success) {
      navigate('/chat');
    } else {
      setLocalError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-100/70 dark:from-[#020b08] dark:via-[#041d14] dark:to-[#02140d] text-slate-900 dark:text-emerald-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-all duration-300">
      {/* Background Radiant Orbs & Mesh Gradients */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-tr from-emerald-400/30 to-teal-300/30 dark:from-emerald-500/20 dark:to-teal-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-gradient-to-br from-green-400/25 via-emerald-300/20 to-teal-400/30 dark:from-emerald-600/15 dark:to-green-500/10 rounded-full blur-3xl pointer-events-none animate-float"></div>

      {/* Top Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl border border-emerald-200/80 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200 shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-emerald-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/20 mb-4 text-white">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome to <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-emerald-400 dark:via-teal-300 dark:to-green-400 bg-clip-text text-transparent">Real Talks</span>
          </h1>
          <p className="mt-2 text-sm text-emerald-800/80 dark:text-emerald-300/80 font-medium">
            Sign in to connect, collaborate, and chat in real time.
          </p>
        </div>

        {/* Clean Glass Login Card */}
        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 dark:bg-[#06241a]/90 border-2 border-emerald-500/25 dark:border-emerald-500/35 shadow-2xl shadow-emerald-600/15 backdrop-blur-2xl relative overflow-hidden">
          {/* Top Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500"></div>

          {localError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or username"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-600/70 hover:text-emerald-800 dark:text-emerald-400/70 dark:hover:text-emerald-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Real Talks...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-emerald-100 dark:border-emerald-800/60 text-center">
            <p className="text-xs text-slate-600 dark:text-emerald-300/80 font-medium">
              Don&apos;t have an account yet?{' '}
              <Link
                to="/register"
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold transition-colors ml-1"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
