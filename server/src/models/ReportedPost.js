import mongoose from 'mongoose';

const reportedPostSchema = new mongoose.Schema({
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
  reason: {
    type: String,
    required: true,
    enum: [
      'spam',
      'harassment',
      'inappropriate',
      'misinformation',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ReportedPost', reportedPostSchema);