import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

// @desc    Submit a rating for a seller
// @route   POST /api/ratings
// @access  Private (Bidder only)
export const submitRating = async (req, res) => {
  try {
    const { auctionId, rating, feedback, communication, accuracy, speed } = req.body;

    // Validate bidder role
    if (req.user.role !== 'bidder') {
      return res.status(403).json({
        status: 'error',
        message: 'Only bidders can submit ratings',
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5',
      });
    }

    // Get auction details
    const auction = await Auction.findById(auctionId).populate('seller');
    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    // Check if auction is completed
    if (auction.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only rate completed auctions',
      });
    }

    // Check if bidder participated in this auction
    const bidderParticipated = await Bid.findOne({
      auction: auctionId,
      bidder: req.user.id,
    });

    if (!bidderParticipated) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only rate auctions you participated in',
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      auction: auctionId,
      bidder: req.user.id,
    });

    if (existingRating) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already rated this auction',
      });
    }

    // Create rating
    const newRating = await Rating.create({
      auction: auctionId,
      seller: auction.seller._id,
      bidder: req.user.id,
      rating,
      feedback: feedback || '',
      communication: communication || rating,
      accuracy: accuracy || rating,
      speed: speed || rating,
    });

    // Update seller's average rating
    await updateSellerRating(auction.seller._id);

    const populatedRating = await Rating.findById(newRating._id)
      .populate('bidder', 'name email')
      .populate('seller', 'name email')
      .populate('auction', 'cryptoName cryptoSymbol');

    res.status(201).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: {
        rating: populatedRating,
      },
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while submitting rating',
    });
  }
};

// @desc    Get ratings for a seller
// @route   GET /api/ratings/seller/:sellerId
// @access  Public
export const getSellerRatings = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ seller: sellerId })
      .populate('bidder', 'name')
      .populate('auction', 'cryptoName cryptoSymbol')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments({ seller: sellerId });

    // Calculate rating breakdown
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid seller id',
      });
    }

    const ratingBreakdown = await Rating.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const seller = await User.findById(sellerId);

    res.json({
      status: 'success',
      data: {
        ratings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRatings: total,
        },
        summary: {
          averageRating: seller?.averageRating || 0,
          totalRatings: seller?.ratingCount || 0,
          breakdown: ratingBreakdown,
        },
      },
    });
  } catch (error) {
    console.error('Get seller ratings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching ratings',
    });
  }
};

// @desc    Get rating for a specific auction by current user
// @route   GET /api/ratings/auction/:auctionId/my-rating
// @access  Private
export const getMyRatingForAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const rating = await Rating.findOne({
      auction: auctionId,
      bidder: req.user.id,
    }).populate('seller', 'name email');

    res.json({
      status: 'success',
      data: {
        rating: rating || null,
      },
    });
  } catch (error) {
    console.error('Get my rating error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching rating',
    });
  }
};

// @desc    Check if user can rate an auction
// @route   GET /api/ratings/auction/:auctionId/can-rate
// @access  Private
export const canRateAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    if (req.user.role !== 'bidder') {
      return res.json({
        status: 'success',
        data: {
          canRate: false,
          reason: 'Only bidders can rate auctions',
        },
      });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    if (auction.status !== 'completed') {
      return res.json({
        status: 'success',
        data: {
          canRate: false,
          reason: 'Auction is not completed yet',
        },
      });
    }

    const bidderParticipated = await Bid.findOne({
      auction: auctionId,
      bidder: req.user.id,
    });

    if (!bidderParticipated) {
      return res.json({
        status: 'success',
        data: {
          canRate: false,
          reason: 'You did not participate in this auction',
        },
      });
    }

    const existingRating = await Rating.findOne({
      auction: auctionId,
      bidder: req.user.id,
    });

    if (existingRating) {
      return res.json({
        status: 'success',
        data: {
          canRate: false,
          reason: 'You have already rated this auction',
          existingRating,
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        canRate: true,
      },
    });
  } catch (error) {
    console.error('Can rate auction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while checking rating eligibility',
    });
  }
};

// Helper function to update seller's average rating
async function updateSellerRating(sellerId) {
  try {
    const ratings = await Rating.find({ seller: sellerId });
    
    if (ratings.length === 0) {
      await User.findByIdAndUpdate(sellerId, {
        averageRating: 0,
        ratingCount: 0,
      });
      return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    await User.findByIdAndUpdate(sellerId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingCount: ratings.length,
    });
  } catch (error) {
    console.error('Update seller rating error:', error);
  }
}

// @desc    Get my submitted ratings
// @route   GET /api/ratings/my-ratings
// @access  Private (Bidder only)
export const getMyRatings = async (req, res) => {
  try {
    if (req.user.role !== 'bidder') {
      return res.status(403).json({
        status: 'error',
        message: 'Only bidders can view their ratings',
      });
    }

    const ratings = await Rating.find({ bidder: req.user.id })
      .populate('seller', 'name email')
      .populate('auction', 'cryptoName cryptoSymbol')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        ratings,
        count: ratings.length,
      },
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching ratings',
    });
  }
};
