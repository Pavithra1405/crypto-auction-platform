import express from 'express';
import {
  getAllBlocks,
  getBlock,
  validateChain,
  getBlockchainStats,
} from '../controllers/blockchainController.js';

const router = express.Router();

// Routes
router.get('/', getAllBlocks);
router.get('/stats', getBlockchainStats);
router.get('/validate', validateChain);
router.get('/:id', getBlock);

export default router;
