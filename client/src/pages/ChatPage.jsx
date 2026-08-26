import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import UserSearchModal from '../components/UserSearchModal';
import ProfileModal from '../components/ProfileModal';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import {
  MessageSquare,
  LogOut,
  Settings,
  Search,
  Users,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { activeConversation, selectConversation, startConversationWithUser } = useChat();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const handleSelectUserFromSearch = async (targetUser) => {
    try {
      await startConversationWithUser(targetUser);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  return (
    <div className="h-screen w-screen bg-emerald-50/50 dark:bg-[#020b08] text-slate-900 dark:text-emerald-50 flex flex-col overflow-hidden select-none transition-colors duration-300">
      {/* 1. Ultra-Modern Top Navigation Bar */}
      <header className="h-16 border-b border-emerald-200/80 dark:border-emerald-900/60 bg-white/90 dark:bg-[#041c14]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0 shadow-md shadow-emerald-500/5 transition-colors">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Real <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">Talks</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-extrabold text-emerald-800 dark:text-emerald-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Real-Time Sockets
            </p>
          </div>
        </div>

        {/* Center/Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="px-3.5 py-2 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2 text-xs font-bold"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-700" />
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>

          {/* New Group Button */}
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all active:scale-95 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">New Group</span>
          </button>

          {/* Find Users Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Find Users</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
            title="Profile & Settings"
          >
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-100/70 dark:bg-[#06241a] border border-emerald-300/80 dark:border-emerald-700/80 cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-6 h-6 rounded-xl bg-white dark:bg-emerald-900 object-cover ring-1 ring-emerald-400"
            />
            <span className="hidden xl:inline text-xs font-bold text-emerald-950 dark:text-emerald-100">
              @{user?.username}
            </span>
          </div>

          {/* Dedicated Prominent Sign Out Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95 cursor-pointer"
            title="Sign out of Real Talks"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Main Chat Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        <div
          className={`w-full md:w-auto h-full flex-shrink-0 ${
            activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ChatSidebar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
          />
        </div>

        <div
          className={`w-full flex-1 h-full ${
            activeConversation ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ChatWindow onBack={() => selectConversation(null)} />
        </div>
      </main>

      {/* 3. Search Users Modal */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectUser={handleSelectUserFromSearch}
      />

      {/* 4. Create Group Channel Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />

      {/* 5. Profile & Privacy Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default ChatPage;
