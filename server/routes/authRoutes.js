import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected Routes
router.get('/me', protectRoute, getMe);

export default router;
