import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  cryptoName: {
    type: String,
    required: [true, 'Crypto name is required'],
    trim: true,
  },
  cryptoSymbol: {
    type: String,
    required: [true, 'Crypto symbol is required'],
    trim: true,
    uppercase: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive'],
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price must be positive'],
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  description: {
    type: String,
    trim: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bidCount: {
    type: Number,
    default: 0,
  },
  blockchainHash: {
    type: String,
    required: true,
  },
  congratsSent: {
    type: Boolean,
    default: false,
  },
  congratsSentAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
auctionSchema.index({ status: 1, endDate: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ cryptoSymbol: 1 });

// Virtual for time left
auctionSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''}`;
});

// Method to check if auction is active
auctionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startDate && 
         now <= this.endDate;
};

// Auto-update status based on dates
auctionSchema.pre('save', function(next) {
  const now = new Date();
  
  // Only auto-complete if end date has passed
  if (now > this.endDate && this.status === 'active') {
    this.status = 'completed';
  }
  
  next();
});

auctionSchema.set('toJSON', { virtuals: true });
auctionSchema.set('toObject', { virtuals: true });

const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;
