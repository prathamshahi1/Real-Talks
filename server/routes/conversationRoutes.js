import express from 'express';
import {
  createOrGetPrivateConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
} from '../controllers/conversationController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();
router.use(protectRoute);

router.post('/private', createOrGetPrivateConversation);
router.get('/', getUserConversations);
router.get('/:id', getConversationById);
router.delete('/:id', deleteConversation);

export default router;
