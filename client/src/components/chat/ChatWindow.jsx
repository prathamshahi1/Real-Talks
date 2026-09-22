import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EmojiPicker from 'emoji-picker-react';
import ImagePreviewModal from './ImagePreviewModal';
import ImageLightboxModal from './ImageLightboxModal';
import GroupInfoModal from './GroupInfoModal';
import {
  Send,
  Smile,
  Paperclip,
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
  MessageSquare,
  Flame,
  Info,
  Users,
  MoreVertical,
  Sparkles
} from 'lucide-react';

const ChatWindow = ({ onBack }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const {
    activeConversation,
    messages,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    deleteConversation,
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
  const [showMenu, setShowMenu] = useState(false);

  // Modals state
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [selectedMsgForActions, setSelectedMsgForActions] = useState(null);

  const isGroup = activeConversation?.type === 'group';

  const otherParticipant = isGroup
    ? null
    : activeConversation?.participants?.find((p) => (p._id || p) !== user?._id) ||
      activeConversation?.participants?.[0];

  const displayName = isGroup ? activeConversation.groupName : otherParticipant?.name;
  const avatarUrl = isGroup ? activeConversation.groupAvatar : otherParticipant?.avatar;

  const isOnline =
    !isGroup &&
    otherParticipant &&
    onlineUsers.has(otherParticipant._id) &&
    otherParticipant.privacy?.showOnlineStatus !== false;

  const currentTypingList = typingUsers[activeConversation?._id] || [];
  const isOtherTyping = currentTypingList.length > 0;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  useEffect(() => {
    if (editingMessage) {
      setInputContent(editingMessage.content);
    }
  }, [editingMessage]);

  const handleInputChange = (e) => {
    setInputContent(e.target.value);
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
      try {
        await editMessage(editingMessage._id, inputContent.trim());
        setInputContent('');
        setEditingMessage(null);
      } catch (err) {
        console.error('Failed to edit:', err);
      }
      return;
    }

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setSelectedImageFile(file);
      setIsImagePreviewOpen(true);
    }
    e.target.value = '';
  };

  const handleSendImageConfirm = async ({ file, caption }) => {
    setUploadingImage(true);
    try {
      await sendImageMessage({
        file,
        caption,
        replyTo: replyingTo,
      });
      setIsImagePreviewOpen(false);
      setSelectedImageFile(null);
      setReplyingTo(null);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCurrentChat = async () => {
    setShowMenu(false);
    if (!window.confirm(`Are you sure you want to delete this chat with "${displayName}"? All message history will be permanently deleted.`)) {
      return;
    }

    try {
      await deleteConversation(activeConversation._id);
    } catch (err) {
      alert('Failed to delete chat: ' + err.message);
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

  const formatMsgTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-emerald-50/30 dark:bg-[#020d09]/50 text-center transition-colors duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-green-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 sm:mb-5 shadow-xl shadow-emerald-600/10 animate-float">
          <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">Welcome to Real Talks</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-300/80 max-w-sm font-medium">
          Select a chat or group from the sidebar to begin real-time messaging, photo sharing, and team collaboration!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-emerald-50/20 dark:bg-[#020c08] relative h-full overflow-hidden transition-colors duration-300">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 1. Chat Header */}
      <header className="pt-safe p-3 sm:p-4 border-b border-emerald-200/80 dark:border-emerald-900/60 bg-white/95 dark:bg-[#041d15]/90 backdrop-blur-xl flex items-center justify-between z-10 shadow-sm transition-colors min-h-[56px] sm:min-h-[64px]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex-shrink-0 cursor-pointer active:scale-95"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="relative cursor-pointer flex-shrink-0"
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 object-cover border-2 border-emerald-300 dark:border-emerald-700 shadow-sm"
            />
            {isGroup ? (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-teal-600 text-[9px] font-bold text-white shadow-sm flex items-center gap-0.5 ring-2 ring-white dark:ring-[#041d15]">
                <Users className="w-2.5 h-2.5" />
              </span>
            ) : isOnline ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#041d15] shadow-sm shadow-emerald-500/50"></span>
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-400 dark:bg-emerald-900 border-2 border-white dark:border-[#041d15]"></span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-tight truncate">
                {displayName || 'Chat Room'}
              </h3>
              {isGroup && (
                <button
                  onClick={() => setIsGroupInfoOpen(true)}
                  className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer flex-shrink-0"
                  title="Group Details"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs mt-0.5 truncate">
              {isOtherTyping ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold animate-pulse flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0"></span>
                  <span className="truncate">{currentTypingList.join(', ')} typing...</span>
                </span>
              ) : isGroup ? (
                <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1 truncate">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span>{activeConversation.participants?.length || 0} members</span>
                </span>
              ) : isOnline ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                  <Radio className="w-3 h-3 animate-pulse flex-shrink-0" />
                  <span>Active Online</span>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-emerald-500/70 font-medium truncate">
                  {otherParticipant?.lastSeen && otherParticipant.privacy?.showLastSeen !== false
                    ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold shadow-sm"
            title="Real-Time Persistent Chat & History"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Real-Time Synchronized</span>
          </div>

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 sm:p-2.5 rounded-xl text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm active:scale-95"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#06241a] rounded-2xl shadow-2xl border-2 border-emerald-200 dark:border-emerald-700/80 py-2 z-50 animate-fade-in">
                {isGroup && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsGroupInfoOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Group Information
                  </button>
                )}

                <button
                  onClick={handleDeleteCurrentChat}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete & Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Message History Feed */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 overscroll-contain"
        onClick={() => setSelectedMsgForActions(null)}
      >
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center py-24 text-emerald-600 dark:text-emerald-400 text-xs gap-2">
            <Loader2 className="w-7 h-7 animate-spin" />
            <span className="font-bold">Syncing message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs space-y-2">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-md">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="font-extrabold text-slate-800 dark:text-emerald-200 text-base">No messages yet</p>
            <p className="text-slate-600 dark:text-emerald-400/80 font-medium">
              Send a text message or attach a photo to begin chatting with {displayName}!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
            const senderName = msg.sender?.name || 'Member';
            const isActionsActive = selectedMsgForActions === msg._id;

            return (
              <div
                key={msg._id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {isGroup && !isMe && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 ml-2 mb-1">
                    {senderName}
                  </span>
                )}

                <div className="relative max-w-[88%] sm:max-w-[75%] md:max-w-[70%]">
                  {/* Action Toolbar on Hover & Tap */}
                  <div
                    className={`absolute -top-4 ${
                      isMe ? 'right-2' : 'left-2'
                    } ${isActionsActive ? 'flex' : 'hidden group-hover:flex'} items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#06241a] border border-emerald-300 dark:border-emerald-700 shadow-xl z-20 animate-fade-in`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setReplyingTo(msg);
                        setSelectedMsgForActions(null);
                      }}
                      title="Reply"
                      className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-600 dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        handleCopy(msg.content || msg.mediaUrl, msg._id);
                        setSelectedMsgForActions(null);
                      }}
                      title="Copy"
                      className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-600 dark:text-emerald-300 transition-colors cursor-pointer"
                    >
                      {copiedId === msg._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isMe && !msg.isDeleted && (
                      <>
                        {!msg.mediaUrl && (
                          <button
                            onClick={() => {
                              setEditingMessage(msg);
                              setSelectedMsgForActions(null);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-600 dark:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteMessage(msg._id);
                            setSelectedMsgForActions(null);
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMsgForActions(isActionsActive ? null : msg._id);
                    }}
                    className={`p-3.5 sm:p-4 rounded-3xl text-sm leading-relaxed shadow-md overflow-hidden transition-all ${
                      isMe
                        ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 text-white rounded-br-sm shadow-emerald-600/20'
                        : 'bg-white dark:bg-[#05261b] border-2 border-emerald-200/80 dark:border-emerald-800/70 text-slate-900 dark:text-emerald-50 rounded-bl-sm shadow-sm'
                    } ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
                  >
                    {/* Reply Quote */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 sm:p-2.5 rounded-2xl text-xs border-l-4 flex flex-col ${
                          isMe
                            ? 'bg-emerald-700/60 border-white text-emerald-50'
                            : 'bg-emerald-50 dark:bg-[#02140d] border-emerald-500 text-slate-700 dark:text-emerald-300'
                        }`}
                      >
                        <span className="font-bold text-[11px] text-emerald-300">
                          {msg.replyTo.sender?.name || 'Reply'}
                        </span>
                        <span className="truncate italic font-medium">
                          {msg.replyTo.isDeleted
                            ? 'Deleted message'
                            : msg.replyTo.content || (msg.replyTo.type === 'image' ? '📷 Image' : '')}
                        </span>
                      </div>
                    )}

                    {/* Image Attachment */}
                    {msg.mediaUrl && !msg.isDeleted && (
                      <div className="mb-2 relative group/img cursor-pointer overflow-hidden rounded-2xl">
                        <img
                          src={msg.mediaUrl}
                          alt="Attachment"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxUrl(msg.mediaUrl);
                          }}
                          className="max-h-60 sm:max-h-72 w-full object-cover rounded-2xl hover:scale-105 transition-transform duration-200 border-2 border-white/20 dark:border-black/20 shadow-md"
                        />
                      </div>
                    )}

                    {/* Text Content */}
                    {msg.content && (
                      <p className="whitespace-pre-wrap break-words font-medium">{msg.content}</p>
                    )}

                    {/* Footer Info */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-semibold ${
                        isMe ? 'text-emerald-100' : 'text-slate-400 dark:text-emerald-400/60'
                      }`}
                    >
                      {msg.isEdited && <span>(edited)</span>}
                      <span>{formatMsgTime(msg.createdAt)}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-teal-200 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-emerald-200 inline" />
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
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs py-1">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#05261b] border-2 border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] font-bold">
              {currentTypingList.join(', ')} is typing a message...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Reply / Edit Banner */}
      {(replyingTo || editingMessage) && (
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-100/95 dark:bg-[#05261b] border-t-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between text-xs animate-slide-up">
          <div className="flex items-center gap-2 truncate text-slate-800 dark:text-emerald-200 font-medium min-w-0 pr-2">
            {replyingTo ? (
              <>
                <Reply className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="truncate">
                  Replying to <b className="text-emerald-900 dark:text-white font-bold">{replyingTo.sender?.name}</b>:{' '}
                  &quot;{replyingTo.content || 'Image'}&quot;
                </span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
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
            className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Responsive Emoji Picker Modal / Popup */}
      {showEmojiPicker && (
        <div
          className="fixed sm:absolute inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 flex items-end sm:items-center justify-center p-2 sm:p-0 bg-black/40 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none"
          onClick={() => setShowEmojiPicker(false)}
        >
          <div
            className="w-full max-w-[340px] sm:w-[320px] bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border-2 border-emerald-300 dark:border-emerald-700 overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-100 dark:border-emerald-800/60 sm:hidden">
              <span className="text-xs font-bold text-slate-800 dark:text-emerald-200">Select Emoji</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <EmojiPicker
              theme={isDark ? 'dark' : 'light'}
              onEmojiClick={handleEmojiClick}
              lazyLoadEmojis
              width="100%"
              height={360}
            />
          </div>
        </div>
      )}

      {/* 5. Floating Message Composer */}
      <footer className="pb-safe p-2 sm:p-4 border-t border-emerald-200/80 dark:border-emerald-900/60 bg-white/95 dark:bg-[#041d15]/95 backdrop-blur-xl flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
            title="Attach Image"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer border shadow-sm active:scale-95 flex-shrink-0 ${
              showEmojiPicker
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800/80'
            }`}
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <input
            type="text"
            value={inputContent}
            onChange={handleInputChange}
            placeholder={
              editingMessage
                ? 'Edit message...'
                : `Message ${displayName || 'chat'}...`
            }
            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl bg-emerald-50/50 dark:bg-[#02130e] border-2 border-emerald-200/80 dark:border-emerald-800/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-xs sm:text-sm font-medium outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!inputContent.trim() || sending}
            className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white transition-all shadow-lg shadow-emerald-600/25 active:scale-95 flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : editingMessage ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </form>
      </footer>

      {/* 6. Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        imageFile={selectedImageFile}
        onClose={() => {
          setIsImagePreviewOpen(false);
          setSelectedImageFile(null);
        }}
        onSend={handleSendImageConfirm}
        sending={uploadingImage}
      />

      {/* 7. Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!activeLightboxUrl}
        imageUrl={activeLightboxUrl}
        onClose={() => setActiveLightboxUrl(null)}
      />

      {/* 8. Group Info Modal */}
      {isGroup && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          group={activeConversation}
        />
      )}
    </div>
  );
};

export default ChatWindow;
