import express from 'express';
import { body } from 'express-validator';
import {
  createAuction,
  getAllAuctions,
  getAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions,
} from '../controllers/auctionController.js';
import { sendCongratsToWinner } from '../controllers/mailController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const auctionValidation = [
  body('cryptoName').trim().notEmpty().withMessage('Crypto name is required'),
  body('cryptoSymbol').trim().notEmpty().withMessage('Crypto symbol is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').isISO8601().withMessage('End date is required'),
];

// Routes
router.get('/', getAllAuctions);
router.get('/my-auctions', protect, authorize('seller'), getMyAuctions);
router.get('/:id', getAuction);
router.post('/:id/send-congrats', protect, authorize('seller'), sendCongratsToWinner);
router.post('/', protect, authorize('seller'), auctionValidation, createAuction);
router.put('/:id', protect, authorize('seller'), updateAuction);
router.delete('/:id', protect, authorize('seller'), deleteAuction);

export default router;
