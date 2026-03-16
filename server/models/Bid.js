import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount must be positive'],
  },
  blockchainHash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'outbid', 'won', 'lost'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });
bidSchema.index({ auction: 1, bidAmount: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
