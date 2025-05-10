import mongoose from 'mongoose';

const savedPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['twitter', 'reddit'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can't save the same post twice
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model('SavedPost', savedPostSchema);