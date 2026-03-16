import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
  },
  // Specific rating criteria
  communication: {
    type: Number,
    min: 1,
    max: 5,
  },
  accuracy: {
    type: Number,
    min: 1,
    max: 5,
  },
  speed: {
    type: Number,
    min: 1,
    max: 5,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one rating per bidder per auction
ratingSchema.index({ auction: 1, bidder: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ seller: 1, createdAt: -1 });
ratingSchema.index({ bidder: 1, createdAt: -1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
