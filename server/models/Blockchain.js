import mongoose from 'mongoose';

const blockchainSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  previousHash: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['genesis', 'auction', 'bid'],
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
blockchainSchema.index({ index: 1 });
blockchainSchema.index({ type: 1 });
blockchainSchema.index({ timestamp: -1 });

const Blockchain = mongoose.model('Blockchain', blockchainSchema);

export default Blockchain;
