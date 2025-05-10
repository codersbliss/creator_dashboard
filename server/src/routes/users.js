import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getCurrentUser, 
  updateProfile, 
  getUserCredits, 
  getUserActivity 
} from '../controllers/userController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', updateProfile);

// @route   GET /api/users/credits
// @desc    Get user credit information
// @access  Private
router.get('/credits', getUserCredits);

// @route   GET /api/users/activity
// @desc    Get user activity history
// @access  Private
router.get('/activity', getUserActivity);

export default router;