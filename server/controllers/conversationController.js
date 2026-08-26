import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @desc    Get or create a 1-on-1 private conversation
 * @route   POST /api/conversations/private
 * @access  Private
 */
export const createOrGetPrivateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required.',
      });
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself.',
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found.',
      });
    }

    // Check if either user has blocked the other
    const isBlockedByCurrent = req.user.blockedUsers?.includes(recipientId);
    const isBlockedByRecipient = recipient.blockedUsers?.includes(currentUserId);

    if (isBlockedByCurrent || isBlockedByRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Unable to start conversation due to user block restrictions.',
      });
    }

    // Find existing private conversation between these 2 users
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    })
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' },
      });

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
        isNew: false,
      });
    }

    // Create new conversation if not found
    conversation = await Conversation.create({
      type: 'private',
      participants: [currentUserId, recipientId],
      unreadCounts: new Map([
        [currentUserId.toString(), 0],
        [recipientId.toString(), 0],
      ]),
    });

    conversation = await Conversation.findById(conversation._id).populate(
      'participants',
      'name username avatar bio isOnline lastSeen privacy'
    );

    res.status(201).json({
      success: true,
      conversation,
      isNew: true,
    });
  } catch (error) {
    console.error('Create/Get Private Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access conversation: ' + error.message,
    });
  }
};

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/conversations
 * @access  Private
 */
export const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations: ' + error.message,
    });
  }
};

/**
 * @desc    Get specific conversation by ID
 * @route   GET /api/conversations/:id
 * @access  Private
 */
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: currentUserId,
    })
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Get Conversation By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation details: ' + error.message,
    });
  }
};
