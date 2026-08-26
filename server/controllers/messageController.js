import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text', mediaUrl, replyTo } = req.body;
    const senderId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required.',
      });
    }

    if (!content?.trim() && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text content or media.',
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    // Create Message document in MongoDB
    const newMessage = await Message.create({
      conversationId,
      sender: senderId,
      type,
      content: content ? content.trim() : '',
      mediaUrl: mediaUrl || '',
      replyTo: replyTo || null,
      status: 'sent',
      readBy: [senderId],
    });

    // Update conversation lastMessage & updatedAt
    conversation.lastMessage = newMessage._id;

    // Increment unread count for other participants
    conversation.participants.forEach((participantId) => {
      const pIdStr = participantId.toString();
      if (pIdStr !== senderId.toString()) {
        const currentCount = conversation.unreadCounts?.get(pIdStr) || 0;
        conversation.unreadCounts?.set(pIdStr, currentCount + 1);
      }
    });

    await conversation.save();

    // Populate sender and reply details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        select: 'content sender type mediaUrl isDeleted',
        populate: { path: 'sender', select: 'name username' },
      });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message: ' + error.message,
    });
  }
};

/**
 * @desc    Get all messages for a specific conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        select: 'content sender type mediaUrl isDeleted',
        populate: { path: 'sender', select: 'name username' },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages: ' + error.message,
    });
  }
};

/**
 * @desc    Edit a sent message
 * @route   PUT /api/messages/:id
 * @access  Private
 */
export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty.',
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this message.',
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a deleted message.',
      });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(id)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        select: 'content sender type mediaUrl isDeleted',
        populate: { path: 'sender', select: 'name username' },
      });

    res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error('Edit Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message: ' + error.message,
    });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this message.',
      });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.mediaUrl = '';
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
      deletedMessageId: id,
      conversationId: message.conversationId,
    });
  } catch (error) {
    console.error('Delete Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message: ' + error.message,
    });
  }
};

/**
 * @desc    Mark all messages in conversation as read
 * @route   POST /api/messages/:conversationId/read
 * @access  Private
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Update unread messages where user is not the sender
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read' },
        $addToSet: { readBy: userId },
      }
    );

    // Reset unread count for this user in the conversation
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCounts?.set(userId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
      conversationId,
    });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read: ' + error.message,
    });
  }
};
