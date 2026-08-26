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
  Moon
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
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden select-none transition-colors">
      {/* 1. Global Top Navigation Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0 shadow-sm transition-colors">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Real Talks
            </h1>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Real-Time Messaging</p>
          </div>
        </div>

        {/* Action Controls & User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline text-xs">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden lg:inline text-xs">Dark</span>
              </>
            )}
          </button>

          {/* New Group Button */}
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-600/15 hover:bg-violet-100 dark:hover:bg-violet-600/25 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="hidden md:inline">New Group</span>
          </button>

          {/* Find Users Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Find Users</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
            />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
              @{user?.username}
            </span>
          </div>

          {/* Prominent Sign Out Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Sign out of Real Talks"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
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
