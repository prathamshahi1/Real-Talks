import User from '../models/User.js';

// Global Map storing online users: userId -> Set of active socketIds (supports multiple tabs)
const userSocketMap = new Map();

/**
 * Get socket IDs for a given user ID
 */
export const getUserSocketIds = (userId) => {
  return userSocketMap.get(userId?.toString()) || new Set();
};

/**
 * Initialize Socket.IO event listeners and real-time room engine
 */
export const setupSocket = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== 'undefined') {
      const userSockets = userSocketMap.get(userId) || new Set();
      userSockets.add(socket.id);
      userSocketMap.set(userId, userSockets);

      console.log(`⚡ User connected: ${userId} (Socket: ${socket.id})`);

      // Update user isOnline in MongoDB
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
      } catch (err) {
        console.error('Error updating online status:', err);
      }

      // Broadcast list of currently online user IDs to all clients
      io.emit('get_online_users', Array.from(userSocketMap.keys()));
      io.emit('user_online', { userId });
    }

    // 1. Join Conversation Room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`🚪 Socket ${socket.id} joined room: ${conversationId}`);
      }
    });

    // 2. Leave Conversation Room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId);
        console.log(`🚪 Socket ${socket.id} left room: ${conversationId}`);
      }
    });

    // 3. Real-Time Message Dispatch
    socket.on('send_message', (messageData) => {
      const { conversationId } = messageData;
      if (conversationId) {
        // Broadcast to everyone in the room (including sender or others)
        socket.to(conversationId).emit('receive_message', messageData);
      }
    });

    // 4. Typing Indicators
    socket.on('typing_start', ({ conversationId, username, userId: typingUserId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('typing_start', {
          conversationId,
          username,
          userId: typingUserId,
        });
      }
    });

    socket.on('typing_stop', ({ conversationId, username, userId: typingUserId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('typing_stop', {
          conversationId,
          username,
          userId: typingUserId,
        });
      }
    });

    // 5. Message Read Receipts
    socket.on('mark_read', ({ conversationId, readerId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('message_read', {
          conversationId,
          readerId,
        });
      }
    });

    // 6. Message Edit Broadcast
    socket.on('edit_message', (updatedMessage) => {
      if (updatedMessage?.conversationId) {
        socket.to(updatedMessage.conversationId).emit('message_edited', updatedMessage);
      }
    });

    // 7. Message Delete Broadcast
    socket.on('delete_message', ({ conversationId, messageId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('message_deleted', {
          conversationId,
          messageId,
        });
      }
    });

    // 8. Conversation Delete Broadcast
    socket.on('delete_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('conversation_deleted', { conversationId });
      }
    });

    // 8. Handle Disconnection
    socket.on('disconnect', async () => {
      if (userId && userId !== 'undefined') {
        const userSockets = userSocketMap.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketMap.delete(userId);

            // Update user offline & lastSeen in MongoDB
            try {
              await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date(),
              });
            } catch (err) {
              console.error('Error updating offline status:', err);
            }

            io.emit('user_offline', { userId, lastSeen: new Date().toISOString() });
            io.emit('get_online_users', Array.from(userSocketMap.keys()));
            console.log(`🔌 User went offline completely: ${userId}`);
          }
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
