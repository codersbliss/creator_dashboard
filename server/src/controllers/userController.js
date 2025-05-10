import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import UserActivity from '../models/UserActivity.js';
import SavedPost from '../models/SavedPost.js';

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};

// Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, website, location } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if profile was previously incomplete and now complete
    const wasProfileComplete = user.profileCompleted;
    
    // Update user data
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;
    
    // Check if profile is now complete
    const isNowComplete = Boolean(
      user.name && user.email && user.bio && user.website && user.location
    );
    
    // If profile is newly completed, award credits
    if (!wasProfileComplete && isNowComplete) {
      user.profileCompleted = true;
      user.credits += 50; // Award 50 credits for completing profile
      
      // Create credit transaction record
      await CreditTransaction.create({
        userId: user._id,
        amount: 50,
        reason: 'Profile completion'
      });
      
      // Log activity
      await UserActivity.create({
        userId: user._id,
        action: 'credit_earned',
        details: 'Earned 50 credits for completing profile'
      });
    }
    
    // Log profile update activity
    await UserActivity.create({
      userId: user._id,
      action: 'profile_update',
      details: 'Updated profile information'
    });
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      website: updatedUser.website,
      location: updatedUser.location,
      role: updatedUser.role,
      credits: updatedUser.credits,
      profileCompleted: updatedUser.profileCompleted,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Get user credit information
export const getUserCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get credit transactions for this user
    const transactions = await CreditTransaction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);
    
    res.json({
      credits: user.credits,
      transactions
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ message: 'Server error retrieving credits' });
  }
};

// Get user activity history
export const getUserActivity = async (req, res) => {
  try {
    const activities = await UserActivity.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10);
    
    res.json(activities);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error retrieving activity' });
  }
};