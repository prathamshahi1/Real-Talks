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
  MoreVertical
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
    if (!window.confirm(`Are you sure you want to delete this chat with "${displayName}"? All message history will be removed.`)) {
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/60 text-center transition-colors">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-lg shadow-indigo-600/5">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your Conversations</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Select a chat or group from the sidebar to begin messaging in Real Talks.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950 relative h-full overflow-hidden transition-colors">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 1. Chat Header */}
      <header className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="relative cursor-pointer"
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700/80 shadow-sm"
            />
            {isGroup ? (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-violet-600 text-[9px] font-bold text-white shadow-sm flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />
              </span>
            ) : isOnline ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm"></span>
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-slate-600 border-2 border-white dark:border-slate-900"></span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {displayName || 'Chat'}
              </h3>
              {isGroup && (
                <button
                  onClick={() => setIsGroupInfoOpen(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Group Details"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs mt-0.5">
              {isOtherTyping ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                  {currentTypingList.join(', ')} typing...
                </span>
              ) : isGroup ? (
                <span className="text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {activeConversation.participants?.length || 0} members
                </span>
              ) : isOnline ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  {otherParticipant?.lastSeen && otherParticipant.privacy?.showLastSeen !== false
                    ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          <div
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium"
            title="MongoDB 24-hour TTL index active"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>24h Auto-Clean</span>
          </div>

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fade-in">
                {isGroup && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsGroupInfoOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Info className="w-4 h-4 text-indigo-500" />
                    Group Information
                  </button>
                )}

                <button
                  onClick={handleDeleteCurrentChat}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs gap-2">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No messages yet</p>
            <p>Send a message or share an image to begin talking with {displayName}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
            const senderName = msg.sender?.name || 'Member';

            return (
              <div
                key={msg._id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {isGroup && !isMe && (
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 ml-2 mb-1">
                    {senderName}
                  </span>
                )}

                <div className="relative max-w-[85%] sm:max-w-[70%]">
                  {/* Action Toolbar on Hover */}
                  <div
                    className={`absolute -top-3.5 ${
                      isMe ? 'right-2' : 'left-2'
                    } hidden group-hover:flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-10 animate-fade-in`}
                  >
                    <button
                      onClick={() => setReplyingTo(msg)}
                      title="Reply"
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(msg.content || msg.mediaUrl, msg._id)}
                      title="Copy"
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {copiedId === msg._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isMe && !msg.isDeleted && (
                      <>
                        {!msg.mediaUrl && (
                          <button
                            onClick={() => setEditingMessage(msg)}
                            title="Edit"
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          title="Delete"
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bubble Card */}
                  <div
                    className={`p-3.5 rounded-3xl text-sm leading-relaxed shadow-sm overflow-hidden ${
                      isMe
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-br-sm shadow-indigo-600/10'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                    } ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
                  >
                    {/* Reply Quote */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 rounded-xl text-xs border-l-2 flex flex-col ${
                          isMe
                            ? 'bg-indigo-700/50 border-white text-indigo-100'
                            : 'bg-slate-50 dark:bg-slate-950/80 border-indigo-500 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-semibold text-[11px] text-indigo-300">
                          {msg.replyTo.sender?.name || 'Reply'}
                        </span>
                        <span className="truncate italic">
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
                          onClick={() => setActiveLightboxUrl(msg.mediaUrl)}
                          className="max-h-72 w-full object-cover rounded-2xl hover:scale-105 transition-transform duration-200 border border-slate-200 dark:border-black/20 shadow-sm"
                        />
                      </div>
                    )}

                    {/* Text */}
                    {msg.content && (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    )}

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                        isMe ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {msg.isEdited && <span>(edited)</span>}
                      <span>{formatMsgTime(msg.createdAt)}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
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

        {/* Typing Bubbles */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] text-slate-400">
              {currentTypingList.join(', ')} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Reply / Edit Banner */}
      {(replyingTo || editingMessage) && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs animate-slide-up">
          <div className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-300">
            {replyingTo ? (
              <>
                <Reply className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>
                  Replying to <b className="text-slate-900 dark:text-white">{replyingTo.sender?.name}</b>:{' '}
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
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-6 z-50 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <EmojiPicker
            theme={isDark ? 'dark' : 'light'}
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis
            width={320}
            height={380}
          />
        </div>
      )}

      {/* 5. Message Composer */}
      <footer className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Attach Image"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              showEmojiPicker
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputContent}
            onChange={handleInputChange}
            placeholder={
              editingMessage
                ? 'Edit your message...'
                : `Message ${displayName || 'chat'}...`
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!inputContent.trim() || sending}
            className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center cursor-pointer"
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
