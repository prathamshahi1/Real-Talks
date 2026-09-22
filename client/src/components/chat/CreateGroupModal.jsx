import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useChat } from '../../context/ChatContext';
import {
  X,
  Users,
  Search,
  Check,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useChat();

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setGroupAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (!groupAvatar) {
      setGroupAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=${groupName || 'group'}`);
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data.success) {
          setAvailableUsers(res.data.users || []);
        }
      } catch (err) {
        console.error('Search error in group modal:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    const delayDebounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isOpen, groupName, groupAvatar]);

  if (!isOpen) return null;

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!groupName.trim()) {
      setErrorMsg('Please enter a group name.');
      return;
    }

    if (selectedUserIds.length === 0) {
      setErrorMsg('Please select at least 1 member to add to the group.');
      return;
    }

    setSubmitting(true);
    try {
      await createGroup({
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        groupAvatar,
        participants: selectedUserIds,
      });
      onClose();
      setGroupName('');
      setGroupDescription('');
      setSelectedUserIds([]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#05261b] border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] transition-colors animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Create Group Channel</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Set up a group chat on Real Talks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-emerald-100/50 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group Avatar & Name */}
          <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200 dark:border-emerald-800/60">
            <img
              src={groupAvatar}
              alt="Group Avatar"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-emerald-950 border-2 border-emerald-400 object-cover shadow-sm flex-shrink-0"
            />
            <div className="flex-1 space-y-2 min-w-0">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    setGroupAvatar(
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${e.target.value || 'group'}`
                    );
                  }}
                  placeholder="e.g. Design & Tech Team"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none"
                />
              </div>

              <button
                type="button"
                onClick={randomizeAvatar}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-100 dark:bg-teal-900/60 hover:bg-teal-200 dark:hover:bg-teal-800/60 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700/60 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3 h-3" />
                Randomize Icon
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1">
              Group Description (Optional)
            </label>
            <textarea
              rows="2"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none resize-none"
            />
          </div>

          {/* Add Members Checklist */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1.5">
              Select Members ({selectedUserIds.length} chosen)
            </label>

            <div className="relative mb-2">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to add..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="max-h-44 sm:max-h-48 overflow-y-auto space-y-1.5 p-1.5 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl bg-emerald-50/40 dark:bg-[#03150f]/60 overscroll-contain">
              {loadingUsers ? (
                <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Searching users...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">No users found</div>
              ) : (
                availableUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleUserSelection(u._id)}
                      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-100/80 dark:bg-emerald-600/25 border border-emerald-400 dark:border-emerald-500/50'
                          : 'hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-emerald-950 object-cover border border-emerald-300 dark:border-emerald-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</h5>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{u.username}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-950'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Group...</span>
                </>
              ) : (
                <span>Create Group Channel</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
