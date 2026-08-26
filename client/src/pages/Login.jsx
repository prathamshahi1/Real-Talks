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
  Moon,
  Zap,
  ShieldCheck,
  Flame,
  Sparkles
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
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

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-8">
        {/* Left Side: Brand Showcase & Feature Pills */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Brand Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Next-Gen MERN Real-Time Platform</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/20">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Real <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-emerald-400 dark:via-teal-300 dark:to-green-400 bg-clip-text text-transparent">Talks</span>
              </h1>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mt-0.5">
                Vibrant • Instant • Secure
              </p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-emerald-100/70 text-base leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
            Connect effortlessly with friends, colleagues, and team channels. Experience lightning-fast WebSocket chat, media sharing, and automated 24h cloud protection.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-emerald-200">Socket.IO Rooms</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/60">&lt;10ms instant delivery</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-emerald-200">24h Auto-Clean</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/60">TTL storage protection</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
              <div className="p-2 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-emerald-200">JWT & Cookies</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/60">HTTP-only protection</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-emerald-200">Media Lightbox</h4>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400/60">Cloud photo zoom</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Colorful Glass Login Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 dark:bg-[#06241a]/90 border-2 border-emerald-500/25 dark:border-emerald-500/35 shadow-2xl shadow-emerald-600/15 backdrop-blur-2xl relative overflow-hidden">
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500"></div>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Welcome Back!</h2>
              <p className="text-xs font-medium text-emerald-800/70 dark:text-emerald-300/70 mt-1">
                Enter your credentials to enter your live workspace
              </p>
            </div>

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
                    <span>Sign In to Chat</span>
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
                  Create free account ✨
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
