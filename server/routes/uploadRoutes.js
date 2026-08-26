import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Upload image route protected with JWT auth and Multer single file parser
router.post('/image', protectRoute, upload.single('image'), uploadImage);

export default router;
