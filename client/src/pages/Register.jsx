import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  Lock,
  User,
  Mail,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Flame,
  Check
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError('');
  };

  const previewAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${
    formData.username.trim() || 'preview'
  }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      bio: formData.bio.trim() || 'Hey there! I am using Real Talks.',
    });
    setLoading(false);

    if (result.success) {
      navigate('/chat');
    } else {
      setLocalError(result.message);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-100/70 dark:from-[#020b08] dark:via-[#041d14] dark:to-[#02140d] text-slate-900 dark:text-emerald-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 pt-safe pb-safe relative overflow-y-auto overscroll-contain transition-all duration-300">
      {/* Radiant Glowing Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-tr from-emerald-400/30 to-teal-300/30 dark:from-emerald-500/20 dark:to-teal-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] bg-gradient-to-br from-green-400/25 via-emerald-300/20 to-teal-400/30 dark:from-emerald-600/15 dark:to-green-500/10 rounded-full blur-3xl pointer-events-none animate-float"></div>

      {/* Floating Theme Toggle */}
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

      <div className="w-full max-w-2xl relative z-10 my-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/20 mb-4 text-white">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Join <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-emerald-400 dark:via-teal-300 dark:to-green-400 bg-clip-text text-transparent">Real Talks</span>
          </h1>
          <p className="mt-2 text-sm text-emerald-800/80 dark:text-emerald-300/80 font-medium">
            Create your account in seconds and unlock real-time chats, group channels, and media sharing.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 dark:bg-[#06241a]/90 border-2 border-emerald-500/25 dark:border-emerald-500/35 shadow-2xl shadow-emerald-600/15 backdrop-blur-2xl relative overflow-hidden">
          {/* Top Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500"></div>

          {/* Live Dynamic Avatar Card */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#031811] border-2 border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
            <img
              src={previewAvatarUrl}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-2xl bg-white dark:bg-emerald-950 border-2 border-emerald-400 shadow-md object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Live Generated Profile Avatar
              </div>
              <p className="text-xs text-slate-600 dark:text-emerald-200/70 mt-0.5 font-medium">
                Type your username below to customize your unique bot avatar automatically!
              </p>
            </div>
          </div>

          {localError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="rahul_99"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 mb-2">
                Status Bio (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  name="bio"
                  rows="2"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Hey there! I am using Real Talks."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border-2 border-emerald-200/80 dark:border-emerald-800/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#020e0a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-sm font-medium transition-all outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Your Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Real Talks Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-800/60 text-center">
            <p className="text-xs text-slate-600 dark:text-emerald-300/80 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold transition-colors ml-1"
              >
                Sign in here ✨
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
