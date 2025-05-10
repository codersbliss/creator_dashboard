import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
  getAllUsers, 
  getUserById, 
  updateUserCredits, 
  getAllTransactions, 
  getReportedPosts, 
  updateReportStatus 
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', getUserById);

// @route   POST /api/admin/users/:id/credits
// @desc    Update user credits
// @access  Private/Admin
router.post('/users/:id/credits', updateUserCredits);

// @route   GET /api/admin/transactions
// @desc    Get all credit transactions
// @access  Private/Admin
router.get('/transactions', getAllTransactions);

// @route   GET /api/admin/reports
// @desc    Get all reported posts
// @access  Private/Admin
router.get('/reports', getReportedPosts);

// @route   PUT /api/admin/reports/:id
// @desc    Update reported post status
// @access  Private/Admin
router.put('/reports/:id', updateReportStatus);

export default router;