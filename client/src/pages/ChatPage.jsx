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
  Menu,
  X,
  UserPlus
} from 'lucide-react';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { activeConversation, selectConversation, startConversationWithUser } = useChat();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectUserFromSearch = async (targetUser) => {
    try {
      await startConversationWithUser(targetUser);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  return (
    <div className="h-[100dvh] w-full min-h-[100dvh] bg-emerald-50/50 dark:bg-[#020b08] text-slate-900 dark:text-emerald-50 flex flex-col overflow-hidden select-none transition-colors duration-300">
      {/* 1. Ultra-Modern Responsive Top Navigation Bar */}
      <header className="h-14 sm:h-16 border-b border-emerald-200/80 dark:border-emerald-900/60 bg-white/95 dark:bg-[#041c14]/95 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 z-20 flex-shrink-0 shadow-md shadow-emerald-500/5 transition-colors">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/30 flex-shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                Real <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">Talks</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-extrabold text-emerald-800 dark:text-emerald-300 hidden xs:inline-block">
                PRO
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
              <span className="truncate">Live Real-Time Sockets</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Find Users Button (Always visible on mobile & tablet) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Find Users"
          >
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="hidden md:inline">Find Users</span>
          </button>

          {/* New Group Button */}
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all active:scale-95 cursor-pointer"
            title="New Group Channel"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline">New Group</span>
          </button>

          {/* Theme Toggle - Desktop & Tablet */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex px-3 py-2 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 shadow-sm transition-all active:scale-95 cursor-pointer items-center gap-1.5 text-xs font-bold"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden lg:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-700" />
                <span className="hidden lg:inline">Dark</span>
              </>
            )}
          </button>

          {/* Settings Trigger - Desktop & Tablet */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="hidden md:flex p-2 sm:px-3 sm:py-2 rounded-2xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm items-center gap-1.5"
            title="Profile & Settings"
          >
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          {/* User Profile Pill - Desktop & Tablet */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-100/70 dark:bg-[#06241a] border border-emerald-300/80 dark:border-emerald-700/80 cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
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

          {/* Dedicated Sign Out Button - Tablet & Desktop */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95 cursor-pointer"
            title="Sign out of Real Talks"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex sm:hidden p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/60 active:scale-95 transition-all cursor-pointer"
            title="Menu"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Popup */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute top-14 right-3 left-3 bg-white dark:bg-[#06241a] rounded-3xl p-4 shadow-2xl border-2 border-emerald-300 dark:border-emerald-700/80 space-y-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Details in Drawer */}
            <div
              onClick={() => {
                setIsProfileOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-[#03150f] border border-emerald-200 dark:border-emerald-800/80 cursor-pointer"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-xl bg-white dark:bg-emerald-900 object-cover ring-2 ring-emerald-400"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                  @{user?.username}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                Edit
              </span>
            </div>

            {/* Mobile Actions Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-[#03150f] border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-slate-800 dark:text-emerald-200"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-emerald-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-[#03150f] border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-slate-800 dark:text-emerald-200"
              >
                <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Settings</span>
              </button>
            </div>

            {/* Logout Option */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold shadow-md shadow-rose-600/25"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Real Talks</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Chat Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        <div
          className={`w-full md:w-80 lg:w-96 h-full flex-shrink-0 ${
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
