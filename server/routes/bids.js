import express from 'express';
import { body } from 'express-validator';
import {
  placeBid,
  getAuctionBids,
  getMyBids,
  getBid,
} from '../controllers/bidController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const bidValidation = [
  body('auctionId').notEmpty().withMessage('Auction ID is required'),
  body('bidAmount').isFloat({ min: 0 }).withMessage('Bid amount must be a positive number'),
];

// Routes
router.post('/', protect, authorize('bidder'), bidValidation, placeBid);
router.get('/my-bids', protect, authorize('bidder'), getMyBids);
router.get('/auction/:auctionId', getAuctionBids);
router.get('/:id', getBid);

export default router;
