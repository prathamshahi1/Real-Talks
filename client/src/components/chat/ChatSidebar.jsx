import React, { useState } from 'react';
import { useChat, getUnreadCount } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  UserPlus,
  Users,
  MessageSquare,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  Sparkles,
  Flame
} from 'lucide-react';

const ChatSidebar = ({ onOpenSearch, onOpenCreateGroup }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    selectConversation,
    deleteConversation,
    onlineUsers,
    loadingConversations,
  } = useChat();

  const [filterQuery, setFilterQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'direct' | 'group'

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

  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !user) return null;
    return conv.participants.find((p) => (p._id || p) !== user._id) || conv.participants[0];
  };

  const handleDeleteChat = async (e, convId, convName) => {
    e.stopPropagation();
    if (!window.confirm(`Delete the chat with "${convName}"? All messages in this thread will be permanently deleted.`)) {
      return;
    }

    try {
      await deleteConversation(convId);
    } catch (err) {
      alert('Failed to delete conversation: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filterType === 'direct' && conv.type === 'group') return false;
    if (filterType === 'group' && conv.type !== 'group') return false;

    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    if (conv.type === 'group') {
      return (
        conv.groupName?.toLowerCase().includes(q) ||
        conv.lastMessage?.content?.toLowerCase().includes(q)
      );
    } else {
      const other = getOtherParticipant(conv);
      if (!other) return false;
      return (
        other.name?.toLowerCase().includes(q) ||
        other.username?.toLowerCase().includes(q) ||
        conv.lastMessage?.content?.toLowerCase().includes(q)
      );
    }
  });

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white/95 dark:bg-[#041911]/95 border-r border-emerald-200/80 dark:border-emerald-900/60 h-full transition-colors duration-300">
      {/* Sidebar Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">Messages</h2>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {conversations.length} Active {conversations.length === 1 ? 'Conversation' : 'Conversations'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCreateGroup}
            className="p-2 sm:p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Create Group"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 transition-all cursor-pointer shadow-sm active:scale-95"
            title="New Direct Message"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-emerald-100/80 dark:border-emerald-900/40 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search chats or channels..."
            className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-2xl bg-emerald-50/60 dark:bg-[#02130d] border border-emerald-200 dark:border-emerald-800/80 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-xs font-medium outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-[#021810] text-slate-600 dark:text-emerald-400/80 hover:bg-emerald-50 dark:hover:bg-emerald-950'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setFilterType('direct')}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
              filterType === 'direct'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-[#021810] text-slate-600 dark:text-emerald-400/80 hover:bg-emerald-50 dark:hover:bg-emerald-950'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setFilterType('group')}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
              filterType === 'group'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-100 dark:bg-[#021810] text-slate-600 dark:text-emerald-400/80 hover:bg-emerald-50 dark:hover:bg-emerald-950'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 overscroll-contain">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-16 text-emerald-600 dark:text-emerald-400 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-semibold">Loading conversation feeds...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-500 dark:text-emerald-400/70 text-xs space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-emerald-200 text-sm">No chats found</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-emerald-400/60 max-w-xs">
                Start a 1-on-1 direct message or create a group channel to begin chatting!
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenSearch}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                Find Users
              </button>
              <button
                onClick={onOpenCreateGroup}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                Create Group
              </button>
            </div>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.type === 'group';
            const other = isGroup ? null : getOtherParticipant(conv);

            const displayName = isGroup ? conv.groupName : other?.name;
            const avatarUrl = isGroup ? conv.groupAvatar : other?.avatar;
            const isOnline =
              !isGroup &&
              other &&
              onlineUsers.has(other._id) &&
              other.privacy?.showOnlineStatus !== false;

            const isSelected = activeConversation?._id === conv._id;
            const unreadCount = getUnreadCount(conv, user?._id);
            const lastMsg = conv.lastMessage;
            const isSenderMe = lastMsg?.sender === user?._id || lastMsg?.sender?._id === user?._id;

            return (
              <div
                key={conv._id}
                onClick={() => selectConversation(conv)}
                className={`group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-transparent dark:from-emerald-500/25 dark:via-teal-500/15 border-2 border-emerald-500 dark:border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border-2 border-transparent active:bg-emerald-100/60 dark:active:bg-emerald-950/60'
                }`}
              >
                {/* Avatar with Glow Ring */}
                <div className="relative flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 object-cover border-2 border-emerald-300 dark:border-emerald-700 shadow-sm"
                  />
                  {isGroup ? (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-teal-600 text-[9px] font-bold text-white shadow-sm flex items-center gap-0.5 ring-2 ring-white dark:ring-[#041911]">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  ) : isOnline ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#041911] shadow-sm shadow-emerald-500/50"></span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-emerald-900 border-2 border-white dark:border-[#041911]"></span>
                  )}
                </div>

                {/* Conversation Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={`text-sm font-extrabold truncate ${
                        isSelected
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {displayName}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold flex-shrink-0 ml-1">
                      {formatTime(lastMsg?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-emerald-300/70">
                    <p className="truncate flex items-center gap-1 text-[11px] pr-2">
                      {isSenderMe && lastMsg && (
                        lastMsg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-600/60 flex-shrink-0" />
                        )
                      )}
                      <span className="truncate font-medium">
                        {lastMsg?.isDeleted
                          ? 'This message was deleted'
                          : lastMsg?.content || (lastMsg?.type === 'image' ? '📷 Image Attachment' : 'Start chatting...')}
                      </span>
                    </p>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Unread Counter Badge */}
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-black shadow-md shadow-emerald-600/30 animate-pulse">
                          {unreadCount}
                        </span>
                      )}

                      {/* Delete Chat Button */}
                      <button
                        onClick={(e) => handleDeleteChat(e, conv._id, displayName)}
                        title="Delete this chat"
                        className="opacity-60 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/70 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
