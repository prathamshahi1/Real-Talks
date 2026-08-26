import express from 'express';
import {
  sendMessage,
  getMessagesByConversation,
  editMessage,
  deleteMessage,
  markMessagesAsRead,
} from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();
router.use(protectRoute);

router.post('/', sendMessage);
router.get('/:conversationId', getMessagesByConversation);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:conversationId/read', markMessagesAsRead);

export default router;
