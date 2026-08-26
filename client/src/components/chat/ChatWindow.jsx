import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import {
  Send,
  Smile,
  Reply,
  Edit2,
  Trash2,
  Copy,
  Check,
  CheckCheck,
  ArrowLeft,
  X,
  Radio,
  Loader2,
  Clock,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

const ChatWindow = ({ onBack }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    emitTyping,
    typingUsers,
    onlineUsers,
    loadingMessages,
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper: Extract other participant
  const otherParticipant = activeConversation?.participants?.find(
    (p) => p._id !== user?._id
  ) || activeConversation?.participants?.[0];

  const isOnline =
    otherParticipant &&
    onlineUsers.has(otherParticipant._id) &&
    otherParticipant.privacy?.showOnlineStatus !== false;

  const currentTypingList = typingUsers[activeConversation?._id] || [];
  const isOtherTyping = currentTypingList.length > 0;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  // Set input content when editing a message
  useEffect(() => {
    if (editingMessage) {
      setInputContent(editingMessage.content);
    }
  }, [editingMessage]);

  // Handle typing debounce
  const handleInputChange = (e) => {
    setInputContent(e.target.value);

    // Emit typing_start immediately
    emitTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    if (editingMessage) {
      // Execute Edit
      try {
        await editMessage(editingMessage._id, inputContent.trim());
        setInputContent('');
        setEditingMessage(null);
      } catch (err) {
        console.error('Failed to edit:', err);
      }
      return;
    }

    // Execute Send
    setSending(true);
    emitTyping(false);
    try {
      await sendMessage({
        content: inputContent.trim(),
        replyTo: replyingTo,
      });
      setInputContent('');
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInputContent((prev) => prev + emojiData.emoji);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper: Format message timestamp
  const formatMsgTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/60 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-600/10">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Your Messages</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Select a chat from the sidebar or click &quot;New Chat&quot; to begin a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative h-full overflow-hidden">
      {/* 1. Chat Header */}
      <header className="p-4 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src={otherParticipant?.avatar}
              alt={otherParticipant?.name}
              className="w-11 h-11 rounded-2xl bg-slate-800 object-cover border border-slate-700/80"
            />
            {isOnline ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm"></span>
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-slate-900"></span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-base leading-tight">
              {otherParticipant?.name || 'Chat Participant'}
            </h3>
            <div className="flex items-center gap-1.5 text-xs mt-0.5">
              {isOtherTyping ? (
                <span className="text-indigo-400 font-medium animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  typing a message...
                </span>
              ) : isOnline ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="text-slate-500">
                  {otherParticipant?.lastSeen && otherParticipant.privacy?.showLastSeen !== false
                    ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Message History Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-xs gap-2">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <span>Loading conversation messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-300 text-sm">No messages here yet</p>
            <p>Send a message below to start your conversation with {otherParticipant?.name}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;

            return (
              <div
                key={msg._id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble Wrapper with Hover Action Bar */}
                <div className="relative max-w-[85%] sm:max-w-[70%]">
                  {/* Action Buttons Toolbar on Hover */}
                  <div
                    className={`absolute -top-3.5 ${
                      isMe ? 'right-2' : 'left-2'
                    } hidden group-hover:flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-10 animate-fade-in`}
                  >
                    <button
                      onClick={() => setReplyingTo(msg)}
                      title="Reply"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.content, msg._id)}
                      title="Copy"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === msg._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isMe && !msg.isDeleted && (
                      <>
                        <button
                          onClick={() => setEditingMessage(msg)}
                          title="Edit"
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          title="Delete"
                          className="p-1 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`p-3.5 rounded-3xl text-sm leading-relaxed shadow-lg ${
                      isMe
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-br-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-sm'
                    } ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
                  >
                    {/* Reply To Reference Quote */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 rounded-xl text-xs border-l-2 flex flex-col ${
                          isMe
                            ? 'bg-indigo-700/50 border-white text-indigo-100'
                            : 'bg-slate-950/80 border-indigo-500 text-slate-300'
                        }`}
                      >
                        <span className="font-semibold text-[11px] text-indigo-300">
                          {msg.replyTo.sender?.name || 'Reply'}
                        </span>
                        <span className="truncate italic">
                          {msg.replyTo.isDeleted
                            ? 'Deleted message'
                            : msg.replyTo.content || 'Media message'}
                        </span>
                      </div>
                    )}

                    {/* Message Content */}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                    {/* Footer Info (Time, Read status, Edited status) */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                        isMe ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.isEdited && <span>(edited)</span>}
                      <span>{formatMsgTime(msg.createdAt)}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-300 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-indigo-200 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Live Typing Bubbles */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] text-slate-500">{otherParticipant?.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Reply / Edit Banner */}
      {(replyingTo || editingMessage) && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs animate-slide-up">
          <div className="flex items-center gap-2 truncate text-slate-300">
            {replyingTo ? (
              <>
                <Reply className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>
                  Replying to <b className="text-white">{replyingTo.sender?.name}</b>: &quot;{replyingTo.content}&quot;
                </span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Editing message...</span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setReplyingTo(null);
              setEditingMessage(null);
              setInputContent('');
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-6 z-50 shadow-2xl rounded-2xl border border-slate-800 overflow-hidden">
          <EmojiPicker
            theme="dark"
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis
            width={320}
            height={380}
          />
        </div>
      )}

      {/* 5. Message Composer */}
      <footer className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              showEmojiPicker
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputContent}
            onChange={handleInputChange}
            placeholder={
              editingMessage
                ? 'Edit your message...'
                : `Message ${otherParticipant?.name || 'user'}...`
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
          />

          {/* Send / Update Button */}
          <button
            type="submit"
            disabled={!inputContent.trim() || sending}
            className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center cursor-pointer"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : editingMessage ? (
              <Check className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
