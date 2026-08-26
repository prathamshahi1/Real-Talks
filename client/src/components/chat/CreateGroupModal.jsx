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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Create Group Channel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set up a group chat on Real Talks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group Avatar & Name */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <img
              src={groupAvatar}
              alt="Group Avatar"
              className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500/40 object-cover shadow-sm"
            />
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <button
                type="button"
                onClick={randomizeAvatar}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Randomize Icon
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Group Description (Optional)
            </label>
            <textarea
              rows="2"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white text-xs outline-none resize-none"
            />
          </div>

          {/* Add Members Checklist */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Members ({selectedUserIds.length} chosen)
            </label>

            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to add..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-1.5 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
              {loadingUsers ? (
                <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
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
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-600/15 border border-indigo-300 dark:border-indigo-500/40'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{u.name}</h5>
                          <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
