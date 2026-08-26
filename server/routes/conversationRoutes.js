import express from 'express';
import {
  createOrGetPrivateConversation,
  getUserConversations,
  getConversationById,
} from '../controllers/conversationController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();
router.use(protectRoute);

router.post('/private', createOrGetPrivateConversation);
router.get('/', getUserConversations);
router.get('/:id', getConversationById);

export default router;
