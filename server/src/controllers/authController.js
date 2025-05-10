import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import UserActivity from '../models/UserActivity.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Award credits to user and log the transaction
const awardCredits = async (userId, amount, reason) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  user.credits += amount;
  await user.save();
  
  // Create credit transaction record
  await CreditTransaction.create({
    userId,
    amount,
    reason
  });
  
  // Log user activity
  await UserActivity.create({
    userId,
    action: 'credit_earned',
    details: `Earned ${amount} credits for ${reason}`
  });
  
  return user;
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Award initial credits (10 credits for signing up)
    await awardCredits(user._id, 10, 'Daily login');
    
    // Log registration activity
    await UserActivity.create({
      userId: user._id,
      action: 'register',
      details: 'Created a new account'
    });
    
    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          profileCompleted: user.profileCompleted,
          createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Authenticate user & get token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Award daily login credits (5 credits per day)
    const lastLogin = user.lastLogin;
    const now = new Date();
    
    // Check if last login was on a different day
    if (!lastLogin || 
        lastLogin.getDate() !== now.getDate() || 
        lastLogin.getMonth() !== now.getMonth() || 
        lastLogin.getFullYear() !== now.getFullYear()) {
      await awardCredits(user._id, 5, 'Daily login');
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    // Log login activity
    await UserActivity.create({
      userId: user._id,
      action: 'login',
      details: 'User logged in'
    });
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};