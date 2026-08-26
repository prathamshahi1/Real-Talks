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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Search Users</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Find people on Real Talks by name, @username, or email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, name, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none"
            />
            {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && users.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <User className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <p className="font-medium text-slate-600 dark:text-slate-400">No users found</p>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => {
                  if (onSelectUser) onSelectUser(u);
                  onClose();
                }}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700" />
                    {u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{u.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{u.username}</p>
                    {u.bio && <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{u.bio}</p>}
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-colors">
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
