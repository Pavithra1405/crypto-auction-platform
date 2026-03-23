import { validationResult } from 'express-validator';
import Auction from '../models/Auction.js';
import { addBlock } from '../utils/blockchain.js';
import { syncAuctionStatuses } from '../utils/statusSync.js';

// @desc    Create new auction
// @route   POST /api/auctions
// @access  Private (Seller only)
export const createAuction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { cryptoName, cryptoSymbol, quantity, basePrice, startDate, endDate, description } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'End date must be after start date',
      });
    }

    const auctionData = {
      cryptoName,
      cryptoSymbol,
      quantity,
      basePrice,
      startDate,
      endDate,
      description,
      seller: req.user.id,
    };

    const block = await addBlock('auction', auctionData);

    const auction = await Auction.create({
      ...auctionData,
      seller: req.user.id,
      blockchainHash: block.hash,
    });

    await auction.populate('seller', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Auction created successfully',
      data: {
        auction,
        blockchainHash: block.hash,
      },
    });
  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating auction',
    });
  }
};

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
export const getAllAuctions = async (req, res) => {
  try {
    await syncAuctionStatuses();

    const { status, cryptoSymbol, sort } = req.query;

    const query = {};
    if (status) query.status = status;
    if (cryptoSymbol) query.cryptoSymbol = cryptoSymbol.toUpperCase();

    let sortOption = { createdAt: -1 };
    if (sort === 'endingSoon') sortOption = { endDate: 1 };
    if (sort === 'highestBid') sortOption = { currentBid: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const auctions = await Auction.find(query)
      .populate('seller', 'name email createdAt averageRating ratingCount')
      .populate('highestBidder', 'name')
      .sort(sortOption);

    res.json({
      status: 'success',
      results: auctions.length,
      data: { auctions },
    });
  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching auctions',
    });
  }
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
export const getAuction = async (req, res) => {
  try {
    await syncAuctionStatuses();

    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email publicKey createdAt averageRating ratingCount')
      .populate('highestBidder', 'name');

    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    res.json({
      status: 'success',
      data: { auction },
    });
  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching auction',
    });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private (Seller only - own auctions)
export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    // Check ownership
    if (auction.seller.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this auction',
      });
    }

    const { description, status } = req.body;

    // Block description edits if bids exist, but always allow status change
    if (description && auction.bidCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update auction description with existing bids',
      });
    }

    if (description) auction.description = description;

    if (status) {
      auction.status = status;
      // If seller closes the auction manually, set endDate to now
      if (status === 'completed') {
        auction.endDate = new Date();
      }
    }

    await auction.save();

    res.json({
      status: 'success',
      message: 'Auction updated successfully',
      data: { auction },
    });
  } catch (error) {
    console.error('Update auction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating auction',
    });
  }
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private (Seller only - own auctions)
export const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    if (auction.seller.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this auction',
      });
    }

    if (auction.bidCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete auction with existing bids',
      });
    }

    await auction.deleteOne();

    res.json({
      status: 'success',
      message: 'Auction deleted successfully',
    });
  } catch (error) {
    console.error('Delete auction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting auction',
    });
  }
};

// @desc    Get my auctions
// @route   GET /api/auctions/my-auctions
// @access  Private (Seller only)
export const getMyAuctions = async (req, res) => {
  try {
    await syncAuctionStatuses({ sellerId: req.user.id });

    const auctions = await Auction.find({ seller: req.user.id })
      .populate('highestBidder', 'name')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: auctions.length,
      data: { auctions },
    });
  } catch (error) {
    console.error('Get my auctions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching auctions',
    });
  }
};
