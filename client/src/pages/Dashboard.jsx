import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  LogOut,
  User,
  Shield,
  Clock,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  Calendar,
  Radio
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl sticky top-0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">PulseChat</h1>
              <p className="text-[11px] text-indigo-400 font-medium">Session Authenticated</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-6 h-6 rounded-full bg-slate-700 object-cover"
              />
              <span className="text-xs font-semibold text-slate-200">@{user?.username}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Authenticated Hub */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 w-full flex-1 space-y-8">
        {/* User Profile Card */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-28 h-28 rounded-3xl bg-slate-950 border-2 border-indigo-500/40 object-cover shadow-xl shadow-indigo-500/10"
            />
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-lg">
              <Radio className="w-3 h-3 animate-pulse" />
              ONLINE
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
                <p className="text-sm text-indigo-400 font-mono">@{user?.username}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-center md:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Active JWT Session
              </span>
            </div>

            <p className="text-sm text-slate-300 max-w-2xl bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 italic">
              &quot;{user?.bio || 'No bio specified.'}&quot;
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Secure HTTP-Only Cookie Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Roadmap & Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">User Search & Directory</h3>
            <p className="text-xs text-slate-400">
              Search by username, full name, or email with instant autocomplete indexing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">1-on-1 Direct Messaging</h3>
            <p className="text-xs text-slate-400">
              Real-time socket rooms, typing indicators, read receipts, and media exchange.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">Group Channels</h3>
            <p className="text-xs text-slate-400">
              Multi-participant rooms, admin privileges, member management, and broadcasting.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        Step 2 Complete • Authentication & User Model Functional
      </footer>
    </div>
  );
};

export default Dashboard;
