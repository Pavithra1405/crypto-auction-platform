import express from 'express';
import {
  submitRating,
  getSellerRatings,
  getMyRatingForAuction,
  canRateAuction,
  getMyRatings,
} from '../controllers/ratingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', protect, submitRating);
router.get('/my-ratings', protect, getMyRatings);
router.get('/auction/:auctionId/my-rating', protect, getMyRatingForAuction);
router.get('/auction/:auctionId/can-rate', protect, canRateAuction);

// Public routes
router.get('/seller/:sellerId', getSellerRatings);

export default router;
