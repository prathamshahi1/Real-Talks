import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // { [conversationId]: [username1, username2] }
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const activeConversationRef = useRef(activeConversation);
  activeConversationRef.current = activeConversation;

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // 2. Select & Load Active Conversation
  const selectConversation = useCallback(async (conversation) => {
    if (!conversation) return;
    setActiveConversation(conversation);
    setReplyingTo(null);
    setEditingMessage(null);

    // Leave previous room and join new one
    socket.emit('join_conversation', conversation._id);

    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/${conversation._id}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }

      // Mark messages as read on server
      await api.post(`/messages/${conversation._id}/read`);
      socket.emit('mark_read', {
        conversationId: conversation._id,
        readerId: user?._id,
      });

      // Reset local unread badge for this conversation
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === conversation._id && c.unreadCounts) {
            const copy = { ...c };
            if (copy.unreadCounts instanceof Map) {
              copy.unreadCounts.set(user._id.toString(), 0);
            }
            return copy;
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // 3. Start or Get Private Conversation with User
  const startConversationWithUser = async (targetUser) => {
    try {
      const res = await api.post('/conversations/private', {
        recipientId: targetUser._id,
      });

      if (res.data.success) {
        const conv = res.data.conversation;
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          if (exists) return prev;
          return [conv, ...prev];
        });
        selectConversation(conv);
        return conv;
      }
    } catch (err) {
      console.error('Start conversation error:', err);
      throw err;
    }
  };

  // 4. Send Message
  const sendMessage = async ({ content, mediaUrl, replyTo }) => {
    if (!activeConversation) return;

    try {
      const payload = {
        conversationId: activeConversation._id,
        content: content?.trim() || '',
        mediaUrl: mediaUrl || '',
        replyTo: replyTo?._id || null,
        type: mediaUrl ? 'image' : 'text',
      };

      const res = await api.post('/messages', payload);
      if (res.data.success) {
        const savedMessage = res.data.message;

        // Append to local message feed
        setMessages((prev) => [...prev, savedMessage]);
        setReplyingTo(null);

        // Emit real-time message via socket
        socket.emit('send_message', savedMessage);

        // Update conversation list lastMessage
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, lastMessage: savedMessage, updatedAt: new Date().toISOString() }
              : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );

        return savedMessage;
      }
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  };

  // 5. Edit Message
  const editMessage = async (messageId, newContent) => {
    try {
      const res = await api.put(`/messages/${messageId}`, {
        content: newContent,
      });

      if (res.data.success) {
        const updated = res.data.message;
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? updated : m))
        );
        socket.emit('edit_message', updated);
        setEditingMessage(null);
      }
    } catch (err) {
      console.error('Edit message error:', err);
      throw err;
    }
  };

  // 6. Delete Message
  const deleteMessage = async (messageId) => {
    try {
      const res = await api.delete(`/messages/${messageId}`);
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, content: 'This message was deleted', mediaUrl: '' }
              : m
          )
        );

        socket.emit('delete_message', {
          conversationId: activeConversation?._id,
          messageId,
        });
      }
    } catch (err) {
      console.error('Delete message error:', err);
      throw err;
    }
  };

  // 7. Typing Emitter
  const emitTyping = (isTyping) => {
    if (!activeConversation || !user) return;
    const eventName = isTyping ? 'typing_start' : 'typing_stop';
    socket.emit(eventName, {
      conversationId: activeConversation._id,
      username: user.username,
      userId: user._id,
    });
  };

  // 8. Setup Global Socket Listeners
  useEffect(() => {
    if (!user) return;

    // Connect socket with userId query parameter
    socket.io.opts.query = { userId: user._id };
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('ping_server', { userId: user._id });
    }

    fetchConversations();

    // Listener: Online users list
    const onOnlineUsers = (usersList) => {
      setOnlineUsers(new Set(usersList));
    };

    const onUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };

    const onUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    // Listener: Incoming Real-Time Message
    const onReceiveMessage = (incomingMessage) => {
      const currentActive = activeConversationRef.current;

      if (currentActive && currentActive._id === incomingMessage.conversationId) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === incomingMessage._id)) return prev;
          return [...prev, incomingMessage];
        });

        // Mark as read immediately if user has the conversation open
        api.post(`/messages/${incomingMessage.conversationId}/read`);
        socket.emit('mark_read', {
          conversationId: incomingMessage.conversationId,
          readerId: user._id,
        });
      }

      // Update conversations list with latest message
      setConversations((prev) => {
        const existingConv = prev.find((c) => c._id === incomingMessage.conversationId);
        if (existingConv) {
          return prev
            .map((c) =>
              c._id === incomingMessage.conversationId
                ? {
                    ...c,
                    lastMessage: incomingMessage,
                    updatedAt: incomingMessage.createdAt || new Date().toISOString(),
                  }
                : c
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          // If conversation is brand new, refresh list
          fetchConversations();
          return prev;
        }
      });
    };

    // Listener: Typing indicator
    const onTypingStart = ({ conversationId, username, userId: typingId }) => {
      if (typingId === user._id) return;
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []).filter((u) => u !== username), username],
      }));
    };

    const onTypingStop = ({ conversationId, username }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((u) => u !== username),
      }));
    };

    // Listener: Message Read Status
    const onMessageRead = ({ conversationId }) => {
      if (activeConversationRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.status !== 'read' ? { ...m, status: 'read' } : m))
        );
      }
    };

    // Listener: Message Edited
    const onMessageEdited = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    // Listener: Message Deleted
    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: 'This message was deleted', mediaUrl: '' }
            : m
        )
      );
    };

    socket.on('get_online_users', onOnlineUsers);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);
    socket.on('receive_message', onReceiveMessage);
    socket.on('typing_start', onTypingStart);
    socket.on('typing_stop', onTypingStop);
    socket.on('message_read', onMessageRead);
    socket.on('message_edited', onMessageEdited);
    socket.on('message_deleted', onMessageDeleted);

    return () => {
      socket.off('get_online_users', onOnlineUsers);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      socket.off('receive_message', onReceiveMessage);
      socket.off('typing_start', onTypingStart);
      socket.off('typing_stop', onTypingStop);
      socket.off('message_read', onMessageRead);
      socket.off('message_edited', onMessageEdited);
      socket.off('message_deleted', onMessageDeleted);
    };
  }, [user, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        onlineUsers,
        typingUsers,
        loadingConversations,
        loadingMessages,
        replyingTo,
        setReplyingTo,
        editingMessage,
        setEditingMessage,
        fetchConversations,
        selectConversation,
        startConversationWithUser,
        sendMessage,
        editMessage,
        deleteMessage,
        emitTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
