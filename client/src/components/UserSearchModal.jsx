import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, X, User, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

const UserSearchModal = ({ isOpen, onClose, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`);
        if (res.data.success) {
          setUsers(res.data.users || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to search users');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#05261b] border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] transition-colors animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Search Users</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Find people on Real Talks by name, @username, or email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-emerald-100/50 dark:hover:bg-emerald-900/60 cursor-pointer transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 border-b border-emerald-100/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-[#03150f]/60">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, name, or email..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-xs sm:text-sm outline-none shadow-sm"
            />
            {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 overscroll-contain">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && users.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <User className="w-10 h-10 mx-auto text-slate-300 dark:text-emerald-800/60 opacity-60" />
              <p className="font-medium text-slate-600 dark:text-emerald-400/80">No users found</p>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => {
                  if (onSelectUser) onSelectUser(u);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-2xl bg-emerald-50/40 dark:bg-[#03150f]/80 hover:bg-emerald-100/70 dark:hover:bg-emerald-600/15 border border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative flex-shrink-0">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-emerald-950 object-cover border border-emerald-300 dark:border-emerald-700" />
                    {u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#05261b]"></span>}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-300 truncate">{u.name}</h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{u.username}</p>
                    {u.bio && <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5">{u.bio}</p>}
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-white dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-colors flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
