import express from 'express';
import {
  searchUsers,
  getUserProfile,
  updateProfile,
  updatePassword,
  updatePrivacy,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// All user routes are protected
router.use(protectRoute);

router.get('/search', searchUsers);
router.get('/profile/:id', getUserProfile);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.put('/privacy', updatePrivacy);
router.get('/blocked', getBlockedUsers);
router.post('/block/:id', blockUser);
router.post('/unblock/:id', unblockUser);

export default router;
