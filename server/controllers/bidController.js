import { validationResult } from 'express-validator';
import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import { addBlock } from '../utils/blockchain.js';
import { syncAuctionStatuses } from '../utils/statusSync.js';

// @desc    Place a bid
// @route   POST /api/bids
// @access  Private (Bidder only)
export const placeBid = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { auctionId, bidAmount } = req.body;

    // Find auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    // Check if auction is active
    if (!auction.isActive()) {
      return res.status(400).json({
        status: 'error',
        message: 'Auction is not active',
      });
    }

    // Check if bid is higher than current bid or base price
    const minimumBid = auction.currentBid > 0 ? auction.currentBid : auction.basePrice;
    if (bidAmount <= minimumBid) {
      return res.status(400).json({
        status: 'error',
        message: `Bid must be higher than ${minimumBid}`,
      });
    }

    // Check if user is the seller
    if (auction.seller.toString() === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot bid on your own auction',
      });
    }

    // Create bid data for blockchain
    const bidData = {
      auctionId: auction._id,
      bidder: req.user.id,
      bidAmount,
      cryptoSymbol: auction.cryptoSymbol,
      timestamp: new Date(),
    };

    // Add to blockchain
    const block = await addBlock('bid', bidData);

    // Create bid in database
    const bid = await Bid.create({
      auction: auctionId,
      bidder: req.user.id,
      bidAmount,
      blockchainHash: block.hash,
    });

    // Update previous highest bid status
    if (auction.highestBidder) {
      await Bid.updateMany(
        { 
          auction: auctionId, 
          bidder: auction.highestBidder,
          status: 'active' 
        },
        { status: 'outbid' }
      );
    }

    // Update auction with new bid
    auction.currentBid = bidAmount;
    auction.highestBidder = req.user.id;
    auction.bidCount += 1;
    await auction.save();

    // Populate bid info
    await bid.populate([
      { path: 'bidder', select: 'name email' },
      { path: 'auction', select: 'cryptoName cryptoSymbol' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Bid placed successfully',
      data: {
        bid,
        blockchainHash: block.hash,
      },
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while placing bid',
    });
  }
};

// @desc    Get bids for an auction
// @route   GET /api/bids/auction/:auctionId
// @access  Public
export const getAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.find({ auction: auctionId })
      .populate('bidder', 'name')
      .sort({ bidAmount: -1, createdAt: -1 });

    res.json({
      status: 'success',
      results: bids.length,
      data: {
        bids,
      },
    });
  } catch (error) {
    console.error('Get auction bids error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching bids',
    });
  }
};

// @desc    Get my bids
// @route   GET /api/bids/my-bids
// @access  Private (Bidder only)
export const getMyBids = async (req, res) => {
  try {
    // Ensure populated auction.status is not stale when viewing my bids
    await syncAuctionStatuses();

    const bids = await Bid.find({ bidder: req.user.id })
      .populate('auction', 'cryptoName cryptoSymbol status currentBid endDate')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: bids.length,
      data: {
        bids,
      },
    });
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching bids',
    });
  }
};

// @desc    Get single bid
// @route   GET /api/bids/:id
// @access  Public
export const getBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('bidder', 'name email')
      .populate('auction', 'cryptoName cryptoSymbol');

    if (!bid) {
      return res.status(404).json({
        status: 'error',
        message: 'Bid not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        bid,
      },
    });
  } catch (error) {
    console.error('Get bid error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching bid',
    });
  }
};
