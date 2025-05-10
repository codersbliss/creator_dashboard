import axios from 'axios';
import User from '../models/User.js';
import SavedPost from '../models/SavedPost.js';
import ReportedPost from '../models/ReportedPost.js';
import UserActivity from '../models/UserActivity.js';
import CreditTransaction from '../models/CreditTransaction.js';

// Mock data function (replace with actual API calls in production)
const fetchMockPosts = (page = 1, source = null) => {
  const mockPosts = [
    // Twitter mock posts
    {
      id: 'twitter-1',
      source: 'twitter',
      content: 'Just released a new creator economy report. Content creators are making 3x more revenue than last year!',
      author: 'creatoreconomy',
      date: new Date('2023-07-15'),
      link: 'https://twitter.com/creatoreconomy/status/1',
      thumbnail: 'https://images.pexels.com/photos/7567444/pexels-photo-7567444.jpeg?auto=compress&cs=tinysrgb&w=500',
      likes: 240,
      comments: 42
    },
    {
      id: 'twitter-2',
      source: 'twitter',
      content: 'Creative burnout is real. Take breaks, set boundaries, and remember why you started creating in the first place.',
      author: 'creatorwellness',
      date: new Date('2023-07-14'),
      link: 'https://twitter.com/creatorwellness/status/1',
      likes: 523,
      comments: 89
    },
    {
      id: 'twitter-3',
      source: 'twitter',
      content: 'New feature alert! You can now schedule your posts directly from our dashboard. No more late night posting!',
      author: 'creatortools',
      date: new Date('2023-07-13'),
      link: 'https://twitter.com/creatortools/status/1',
      thumbnail: 'https://images.pexels.com/photos/5273267/pexels-photo-5273267.jpeg?auto=compress&cs=tinysrgb&w=500',
      likes: 176,
      comments: 23
    },
    // Reddit mock posts
    {
      id: 'reddit-1',
      source: 'reddit',
      content: 'Ive been creating content for 3 years and just hit 1 million subscribers. Heres everything I learned along the way [Long Post]',
      author: 'contentcreator123',
      date: new Date('2023-07-15'),
      link: 'https://reddit.com/r/contentcreation/comments/1',
      thumbnail: 'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=500',
      likes: 1520,
      comments: 231
    },
    {
      id: 'reddit-2',
      source: 'reddit',
      content: 'What camera/microphone setup are you all using? Looking to upgrade my equipment without breaking the bank.',
      author: 'newcreator42',
      date: new Date('2023-07-14'),
      link: 'https://reddit.com/r/contentcreation/comments/2',
      likes: 65,
      comments: 87
    },
    {
      id: 'reddit-3',
      source: 'reddit',
      content: 'I switched from daily uploads to quality weekly content and my engagement went up 200%. Quality > Quantity',
      author: 'videocreator',
      date: new Date('2023-07-13'),
      link: 'https://reddit.com/r/contentcreation/comments/3',
      thumbnail: 'https://images.pexels.com/photos/13286813/pexels-photo-13286813.jpeg?auto=compress&cs=tinysrgb&w=500',
      likes: 932,
      comments: 114
    },
    // More posts for pagination
    {
      id: 'twitter-4',
      source: 'twitter',
      content: 'The future of content creation is in AI collaboration, not replacement. Embrace tools that enhance your creativity!',
      author: 'aicreator',
      date: new Date('2023-07-12'),
      link: 'https://twitter.com/aicreator/status/1',
      thumbnail: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=500',
      likes: 412,
      comments: 67
    },
    {
      id: 'reddit-4',
      source: 'reddit',
      content: 'Tax tips for content creators: Heres how I organize my business expenses and save thousands each year.',
      author: 'creatorfinance',
      date: new Date('2023-07-12'),
      link: 'https://reddit.com/r/contentcreation/comments/4',
      likes: 788,
      comments: 134
    }
  ];
  
  // Filter by source if provided
  const filteredPosts = source ? mockPosts.filter(post => post.source === source) : mockPosts;
  
  // Basic pagination - 4 items per page
  const itemsPerPage = 4;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    nextPage: endIndex < filteredPosts.length ? String(page + 1) : null
  };
};

// Get feed posts
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const source = req.query.source; // Optional filter
    
    // In a real implementation, we would make API calls to Twitter, Reddit, etc.
    // For this demo, we'll use mock data
    const feedData = fetchMockPosts(page, source);
    
    res.json(feedData);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error retrieving feed' });
  }
};

// Save a post
export const savePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;
    
    // Check if post is already saved
    const existingSave = await SavedPost.findOne({ userId, postId });
    
    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }
    
    // In a real app, we would fetch the post details from Twitter/Reddit API
    // using the postId. For this demo, we'll use mock data
    const allPosts = fetchMockPosts(1).posts.concat(fetchMockPosts(2).posts);
    const postToSave = allPosts.find(post => post.id === postId);
    
    if (!postToSave) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create saved post
    const savedPost = await SavedPost.create({
      userId,
      postId: postToSave.id,
      source: postToSave.source,
      content: postToSave.content,
      author: postToSave.author,
      date: postToSave.date,
      link: postToSave.link,
      thumbnail: postToSave.thumbnail
    });
    
    // Log activity
    await UserActivity.create({
      userId,
      action: 'save_post',
      details: `Saved a post from ${postToSave.source}`
    });
    
    // Award 2 credits for interaction
    const user = await User.findById(userId);
    user.credits += 2;
    await user.save();
    
    // Create credit transaction
    await CreditTransaction.create({
      userId,
      amount: 2,
      reason: 'Content interaction'
    });
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Server error saving post' });
  }
};

// Report a post
export const reportPost = async (req, res) => {
  try {
    const { postId, reason } = req.body;
    const userId = req.user._id;
    
    // Check if user has already reported this post
    const existingReport = await ReportedPost.findOne({ userId, postId });
    
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }
    
    // Find the post in our mock data
    const allPosts = fetchMockPosts(1).posts.concat(fetchMockPosts(2).posts);
    const postToReport = allPosts.find(post => post.id === postId);
    
    if (!postToReport) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create report
    const report = await ReportedPost.create({
      userId,
      postId,
      source: postToReport.source,
      reason
    });
    
    // Log activity
    await UserActivity.create({
      userId,
      action: 'report_post',
      details: `Reported a post for ${reason}`
    });
    
    res.status(201).json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server error reporting post' });
  }
};

// Get saved posts
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const savedPosts = await SavedPost.find({ userId })
      .sort({ savedAt: -1 });
    
    res.json(savedPosts);
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ message: 'Server error retrieving saved posts' });
  }
};

// Remove a saved post
export const removeSavedPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;
    
    const savedPost = await SavedPost.findOneAndDelete({ userId, postId });
    
    if (!savedPost) {
      return res.status(404).json({ message: 'Saved post not found' });
    }
    
    // Log activity
    await UserActivity.create({
      userId,
      action: 'save_post',
      details: `Removed a saved post from ${savedPost.source}`
    });
    
    res.json({ message: 'Post removed from saved items' });
  } catch (error) {
    console.error('Remove saved post error:', error);
    res.status(500).json({ message: 'Server error removing saved post' });
  }
};