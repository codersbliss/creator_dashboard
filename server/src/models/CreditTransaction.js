import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Daily login',
      'Profile completion',
      'Content interaction',
      'Admin adjustment',
      'Bonus reward',
      'Contest winner',
      'Correction',
      'Penalty'
    ]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CreditTransaction', creditTransactionSchema);