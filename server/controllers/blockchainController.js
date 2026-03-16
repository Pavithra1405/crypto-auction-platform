import Blockchain from '../models/Blockchain.js';
import { validateBlockchain } from '../utils/blockchain.js';

// @desc    Get all blocks
// @route   GET /api/blockchain
// @access  Public
export const getAllBlocks = async (req, res) => {
  try {
    const { type, limit } = req.query;

    const query = {};
    if (type) query.type = type;

    const blocks = await Blockchain.find(query)
      .sort({ index: -1 })
      .limit(limit ? parseInt(limit) : 0);

    res.json({
      status: 'success',
      results: blocks.length,
      data: {
        blocks: blocks.reverse(), // Return in chronological order
      },
    });
  } catch (error) {
    console.error('Get blocks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching blocks',
    });
  }
};

// @desc    Get single block
// @route   GET /api/blockchain/:id
// @access  Public
export const getBlock = async (req, res) => {
  try {
    const block = await Blockchain.findById(req.params.id);

    if (!block) {
      return res.status(404).json({
        status: 'error',
        message: 'Block not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        block,
      },
    });
  } catch (error) {
    console.error('Get block error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching block',
    });
  }
};

// @desc    Validate blockchain
// @route   GET /api/blockchain/validate
// @access  Public
export const validateChain = async (req, res) => {
  try {
    const isValid = await validateBlockchain();

    res.json({
      status: 'success',
      data: {
        isValid,
        message: isValid ? 'Blockchain is valid' : 'Blockchain is invalid',
      },
    });
  } catch (error) {
    console.error('Validate chain error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while validating blockchain',
    });
  }
};

// @desc    Get blockchain statistics
// @route   GET /api/blockchain/stats
// @access  Public
export const getBlockchainStats = async (req, res) => {
  try {
    const totalBlocks = await Blockchain.countDocuments();
    const genesisBlocks = await Blockchain.countDocuments({ type: 'genesis' });
    const auctionBlocks = await Blockchain.countDocuments({ type: 'auction' });
    const bidBlocks = await Blockchain.countDocuments({ type: 'bid' });
    const isValid = await validateBlockchain();

    const latestBlock = await Blockchain.findOne().sort({ index: -1 });

    res.json({
      status: 'success',
      data: {
        stats: {
          totalBlocks,
          genesisBlocks,
          auctionBlocks,
          bidBlocks,
          isValid,
          latestBlock: latestBlock ? {
            index: latestBlock.index,
            hash: latestBlock.hash,
            timestamp: latestBlock.timestamp,
          } : null,
        },
      },
    });
  } catch (error) {
    console.error('Get blockchain stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching stats',
    });
  }
};
