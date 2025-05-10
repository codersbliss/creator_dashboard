import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getFeed, 
  savePost, 
  reportPost, 
  getSavedPosts, 
  removeSavedPost 
} from '../controllers/feedController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   GET /api/feed
// @desc    Get feed posts
// @access  Private
router.get('/', getFeed);

// @route   POST /api/feed/save
// @desc    Save a post
// @access  Private
router.post('/save', savePost);

// @route   POST /api/feed/report
// @desc    Report a post
// @access  Private
router.post('/report', reportPost);

// @route   GET /api/feed/saved
// @desc    Get saved posts
// @access  Private
router.get('/saved', getSavedPosts);

// @route   DELETE /api/feed/saved/:postId
// @desc    Remove a saved post
// @access  Private
router.delete('/saved/:postId', removeSavedPost);

export default router;