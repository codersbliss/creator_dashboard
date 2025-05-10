import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import UserActivity from '../models/UserActivity.js';
import SavedPost from '../models/SavedPost.js';
import ReportedPost from '../models/ReportedPost.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};

// Update user credits
export const updateUserCredits = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const userId = req.params.id;
    
    if (!amount || !reason) {
      return res.status(400).json({ message: 'Amount and reason are required' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user credits
    user.credits += amount;
    await user.save();
    
    // Create credit transaction
    await CreditTransaction.create({
      userId,
      amount,
      reason
    });
    
    // Log activity
    await UserActivity.create({
      userId,
      action: 'credit_earned',
      details: `Admin adjusted credits: ${amount > 0 ? '+' : ''}${amount} for ${reason}`
    });
    
    res.json(user);
  } catch (error) {
    console.error('Update credits error:', error);
    res.status(500).json({ message: 'Server error updating credits' });
  }
};

// Get all credit transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await CreditTransaction.find({})
      .populate('userId', 'name email')
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// Get all reported posts
export const getReportedPosts = async (req, res) => {
  try {
    const reports = await ReportedPost.find({})
      .populate('userId', 'name email')
      .sort({ reportedAt: -1 });
    
    res.json(reports);
  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({ message: 'Server error retrieving reported posts' });
  }
};

// Update reported post status
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reportId = req.params.id;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const report = await ReportedPost.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    report.status = status;
    await report.save();
    
    res.json(report);
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error updating report status' });
  }
};