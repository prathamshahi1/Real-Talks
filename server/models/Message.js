import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Compound Index for fast message history retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });

// 2. TTL (Time-To-Live) 24-Hour Auto-Delete Index
// MongoDB's background thread automatically removes documents older than 24 hours (86,400 seconds)
// to prevent exceeding free tier database storage limits!
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, name: 'auto_delete_24h_ttl' });

const Message = mongoose.model('Message', messageSchema);

export default Message;
