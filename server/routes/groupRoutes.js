import express from 'express';
import {
  createGroup,
  getGroupDetails,
  addMembers,
  removeMember,
  leaveGroup,
  promoteToAdmin,
  updateGroupProfile,
} from '../controllers/groupController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.use(protectRoute);

router.post('/', createGroup);
router.get('/:id', getGroupDetails);
router.put('/:id', updateGroupProfile);
router.post('/:id/members', addMembers);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/leave', leaveGroup);
router.post('/:id/admins/:memberId', promoteToAdmin);

export default router;
