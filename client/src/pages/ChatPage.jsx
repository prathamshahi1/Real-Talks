import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
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
  UserPlus,
  Users
} from 'lucide-react';

const ChatPage = () => {
  const { user, logout } = useAuth();
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
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* 1. Global Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">PulseChat</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Group Button */}
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">New Group</span>
          </button>

          {/* Search Direct Users */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Find Users</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-indigo-500/40 transition-colors"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-5 h-5 rounded-full bg-slate-700 object-cover"
            />
            <span className="hidden sm:inline text-xs font-semibold text-slate-200">
              @{user?.username}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Chat Layout (Sidebar + ChatWindow) */}
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
