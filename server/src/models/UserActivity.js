import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'register',
      'profile_update',
      'save_post',
      'report_post',
      'credit_earned',
      'logout'
    ]
  },
  details: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('UserActivity', userActivitySchema);