import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sliders
} from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserLocally } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [privacy, setPrivacy] = useState({
    showOnlineStatus: user?.privacy?.showOnlineStatus ?? true,
    showLastSeen: user?.privacy?.showLastSeen ?? true,
    readReceipts: user?.privacy?.readReceipts ?? true,
    typingIndicator: user?.privacy?.typingIndicator ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/users/profile', { name, bio, avatar });
      if (res.data.success) {
        updateUserLocally(res.data.user);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/users/password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.data.success) {
        setSuccessMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivacy = async (field) => {
    const updated = { ...privacy, [field]: !privacy[field] };
    setPrivacy(updated);

    try {
      const res = await api.put('/users/privacy', updated);
      if (res.data.success) {
        updateUserLocally({ privacy: updated });
      }
    } catch (err) {
      console.error('Privacy update error:', err);
    }
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setAvatar(newAvatar);
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
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Account & Preferences</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Manage profile details, security and privacy</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-emerald-100/50 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#03150f]/60 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-600 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-600 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('privacy');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-600 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: Edit Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200 dark:border-emerald-800/60">
                <img
                  src={avatar || user?.avatar}
                  alt="Avatar"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-emerald-950 border-2 border-emerald-400 object-cover shadow-sm flex-shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Profile Avatar</h4>
                  <button
                    type="button"
                    onClick={generateRandomAvatar}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Randomize</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1.5">
                  Bio
                </label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none resize-none"
                />
                <p className="text-[10px] text-slate-400 dark:text-emerald-500/70 text-right mt-1">{bio.length}/160</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25 active:scale-98"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Profile Changes
              </button>
            </form>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1.5">
                  Current Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1.5">
                  New Password (min 6 chars)
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#02130e] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white text-xs sm:text-sm outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-emerald-400 dark:hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPass ? 'Hide passwords' : 'Show passwords'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25 active:scale-98"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Update Password
              </button>
            </form>
          )}

          {/* TAB 3: Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200 dark:border-emerald-800/60">
                <div className="pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Show Online Status</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Allow other users to see when you are online</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('showOnlineStatus')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                    privacy.showOnlineStatus ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-emerald-950'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.showOnlineStatus ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200 dark:border-emerald-800/60">
                <div className="pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Show Last Seen</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Display timestamp of when you were last active</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('showLastSeen')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                    privacy.showLastSeen ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-emerald-950'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.showLastSeen ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200 dark:border-emerald-800/60">
                <div className="pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Read Receipts</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Send checkmarks when you read messages</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('readReceipts')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                    privacy.readReceipts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-emerald-950'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.readReceipts ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200 dark:border-emerald-800/60">
                <div className="pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Typing Indicator</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-emerald-400/80">Let others know when you are typing</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('typingIndicator')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                    privacy.typingIndicator ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-emerald-950'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacy.typingIndicator ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
