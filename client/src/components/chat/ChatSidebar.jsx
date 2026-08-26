import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  UserPlus,
  MessageSquare,
  Users,
  Check,
  CheckCheck,
  Loader2
} from 'lucide-react';

const ChatSidebar = ({ onOpenSearch }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    selectConversation,
    onlineUsers,
    loadingConversations,
  } = useChat();

  const [filterQuery, setFilterQuery] = useState('');

  // Helper: Extract other participant in private chat
  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !user) return null;
    return conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
  };

  // Helper: Format message time nicely
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter conversations by participant name or username
  const filteredConversations = conversations.filter((conv) => {
    if (!filterQuery.trim()) return true;
    const other = getOtherParticipant(conv);
    if (!other) return false;
    const q = filterQuery.toLowerCase();
    return (
      other.name?.toLowerCase().includes(q) ||
      other.username?.toLowerCase().includes(q) ||
      conv.lastMessage?.content?.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-slate-900/90 border-r border-slate-800/80 h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-white text-base">Messages</h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-xs font-semibold">
            {conversations.length}
          </span>
        </div>

        <button
          onClick={onOpenSearch}
          className="p-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="New Direct Message"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Search Conversations Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 text-xs outline-none transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs gap-2">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            <span>Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-500 text-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-300">No conversations yet</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Click &quot;New Chat&quot; above to search users and start messaging!
              </p>
            </div>
            <button
              onClick={onOpenSearch}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
            >
              Start a Conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const other = getOtherParticipant(conv);
            if (!other) return null;

            const isOnline = onlineUsers.has(other._id) && other.privacy?.showOnlineStatus !== false;
            const isSelected = activeConversation?._id === conv._id;
            const unreadCount = conv.unreadCounts?.[user?._id] || 0;
            const lastMsg = conv.lastMessage;
            const isSenderMe = lastMsg?.sender === user?._id || lastMsg?.sender?._id === user?._id;

            return (
              <div
                key={conv._id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/15 border border-indigo-500/40 shadow-sm'
                    : 'hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {/* Avatar with live online dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={other.avatar}
                    alt={other.name}
                    className="w-12 h-12 rounded-2xl bg-slate-800 object-cover border border-slate-700/80"
                  />
                  {isOnline ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm"></span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-slate-900"></span>
                  )}
                </div>

                {/* Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-indigo-300' : 'text-white'
                      }`}
                    >
                      {other.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-1">
                      {formatTime(lastMsg?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <p className="truncate flex items-center gap-1 text-[11px]">
                      {isSenderMe && lastMsg && (
                        lastMsg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        )
                      )}
                      <span>
                        {lastMsg?.isDeleted
                          ? 'This message was deleted'
                          : lastMsg?.content || (lastMsg?.type === 'image' ? '📷 Image' : 'Start chatting...')}
                      </span>
                    </p>

                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex-shrink-0 ml-2 shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
