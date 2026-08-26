import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const getUnreadCount = (conversation, userId) => {
  if (!conversation || !conversation.unreadCounts || !userId) return 0;
  const uIdStr = (userId._id || userId).toString();
  if (conversation.unreadCounts instanceof Map) {
    return conversation.unreadCounts.get(uIdStr) || 0;
  }
  return conversation.unreadCounts[uIdStr] || 0;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
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
    if (!conversation) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    setActiveConversation(conversation);
    setReplyingTo(null);
    setEditingMessage(null);

    // Instantly zero-out local unread badge
    const userIdStr = user?._id?.toString();
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id === conversation._id) {
          const updated = { ...c };
          if (updated.unreadCounts) {
            if (updated.unreadCounts instanceof Map) {
              updated.unreadCounts.set(userIdStr, 0);
            } else {
              updated.unreadCounts = { ...updated.unreadCounts, [userIdStr]: 0 };
            }
          }
          return updated;
        }
        return c;
      })
    );

    // Join room
    socket.emit('join_conversation', conversation._id);

    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/${conversation._id}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }

      // Mark messages as read on backend server
      await api.post(`/messages/${conversation._id}/read`);
      socket.emit('mark_read', {
        conversationId: conversation._id,
        readerId: user?._id,
      });
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // 3. Start or Get Private Conversation
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

        setMessages((prev) => [...prev, savedMessage]);
        setReplyingTo(null);

        socket.emit('send_message', savedMessage);

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

  // Send Image Message
  const sendImageMessage = async ({ file, caption, replyTo }) => {
    if (!activeConversation || !file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadRes.data.success && uploadRes.data.url) {
        return await sendMessage({
          content: caption,
          mediaUrl: uploadRes.data.url,
          replyTo,
        });
      }
    } catch (err) {
      console.error('Send image error:', err);
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

  // 7. Delete Full Conversation
  const deleteConversation = async (conversationId) => {
    try {
      const res = await api.delete(`/conversations/${conversationId}`);
      if (res.data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConversationRef.current?._id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }

        socket.emit('delete_conversation', { conversationId });
      }
    } catch (err) {
      console.error('Delete conversation error:', err);
      throw err;
    }
  };

  // 8. Typing Emitter
  const emitTyping = (isTyping) => {
    if (!activeConversation || !user) return;
    const eventName = isTyping ? 'typing_start' : 'typing_stop';
    socket.emit(eventName, {
      conversationId: activeConversation._id,
      username: user.username,
      userId: user._id,
    });
  };

  // 9. Group Actions
  const createGroup = async (groupData) => {
    try {
      const res = await api.post('/groups', groupData);
      if (res.data.success) {
        const newGroup = res.data.group;
        setConversations((prev) => [newGroup, ...prev]);
        selectConversation(newGroup);
        return newGroup;
      }
    } catch (err) {
      console.error('Create group error:', err);
      throw err;
    }
  };

  const addMembersToGroup = async (groupId, memberIds) => {
    try {
      const res = await api.post(`/groups/${groupId}/members`, { memberIds });
      if (res.data.success) {
        const updatedGroup = res.data.group;
        setConversations((prev) =>
          prev.map((c) => (c._id === groupId ? updatedGroup : c))
        );
        if (activeConversation?._id === groupId) {
          setActiveConversation(updatedGroup);
        }
      }
    } catch (err) {
      console.error('Add members error:', err);
      throw err;
    }
  };

  const removeMemberFromGroup = async (groupId, memberId) => {
    try {
      const res = await api.delete(`/groups/${groupId}/members/${memberId}`);
      if (res.data.success) {
        const updatedGroup = res.data.group;
        setConversations((prev) =>
          prev.map((c) => (c._id === groupId ? updatedGroup : c))
        );
        if (activeConversation?._id === groupId) {
          setActiveConversation(updatedGroup);
        }
      }
    } catch (err) {
      console.error('Remove member error:', err);
      throw err;
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const res = await api.post(`/groups/${groupId}/leave`);
      if (res.data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== groupId));
        if (activeConversation?._id === groupId) {
          setActiveConversation(null);
        }
      }
    } catch (err) {
      console.error('Leave group error:', err);
      throw err;
    }
  };

  const promoteToAdmin = async (groupId, memberId) => {
    try {
      const res = await api.post(`/groups/${groupId}/admins/${memberId}`);
      if (res.data.success) {
        const updatedGroup = res.data.group;
        setConversations((prev) =>
          prev.map((c) => (c._id === groupId ? updatedGroup : c))
        );
        if (activeConversation?._id === groupId) {
          setActiveConversation(updatedGroup);
        }
      }
    } catch (err) {
      console.error('Promote admin error:', err);
      throw err;
    }
  };

  // 10. Global Socket Listeners
  useEffect(() => {
    if (!user) return;

    socket.io.opts.query = { userId: user._id };
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('ping_server', { userId: user._id });
    }

    fetchConversations();

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

    // Incoming Real-Time Message
    const onReceiveMessage = (incomingMessage) => {
      const currentActive = activeConversationRef.current;
      const myUserId = user?._id?.toString();

      if (currentActive && currentActive._id === incomingMessage.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === incomingMessage._id)) return prev;
          return [...prev, incomingMessage];
        });

        // Mark as read immediately on backend & socket
        api.post(`/messages/${incomingMessage.conversationId}/read`);
        socket.emit('mark_read', {
          conversationId: incomingMessage.conversationId,
          readerId: user._id,
        });
      }

      // Update conversations list & unread count
      setConversations((prev) => {
        const isCurrentOpen = currentActive?._id === incomingMessage.conversationId;
        const exists = prev.find((c) => c._id === incomingMessage.conversationId);

        if (exists) {
          return prev
            .map((c) => {
              if (c._id === incomingMessage.conversationId) {
                const updated = {
                  ...c,
                  lastMessage: incomingMessage,
                  updatedAt: incomingMessage.createdAt || new Date().toISOString(),
                };

                // Increment unread count only if not currently looking at this conversation
                if (!isCurrentOpen && myUserId) {
                  const currentCount = getUnreadCount(c, myUserId);
                  if (updated.unreadCounts instanceof Map) {
                    updated.unreadCounts.set(myUserId, currentCount + 1);
                  } else {
                    updated.unreadCounts = {
                      ...updated.unreadCounts,
                      [myUserId]: currentCount + 1,
                    };
                  }
                }
                return updated;
              }
              return c;
            })
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

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

    const onMessageRead = ({ conversationId }) => {
      if (activeConversationRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.status !== 'read' ? { ...m, status: 'read' } : m))
        );
      }
    };

    const onMessageEdited = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: 'This message was deleted', mediaUrl: '' }
            : m
        )
      );
    };

    const onConversationDeleted = ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (activeConversationRef.current?._id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
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
    socket.on('conversation_deleted', onConversationDeleted);

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
      socket.off('conversation_deleted', onConversationDeleted);
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
        sendImageMessage,
        editMessage,
        deleteMessage,
        deleteConversation,
        emitTyping,
        createGroup,
        addMembersToGroup,
        removeMemberFromGroup,
        leaveGroup,
        promoteToAdmin,
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
