import express from 'express';
import { getUser, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/:id', getUser);
router.put('/profile', protect, updateProfile);

export default router;
