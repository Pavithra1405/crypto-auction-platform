import CryptoJS from 'crypto-js';
import Blockchain from '../models/Blockchain.js';

// Calculate hash for a block
export const calculateHash = (index, timestamp, data, previousHash) => {
  return CryptoJS.SHA256(index + timestamp + JSON.stringify(data) + previousHash).toString();
};

// Get the latest block
export const getLatestBlock = async () => {
  const latestBlock = await Blockchain.findOne().sort({ index: -1 });
  return latestBlock;
};

// Create genesis block if doesn't exist
export const createGenesisBlock = async () => {
  const exists = await Blockchain.findOne({ index: 0 });
  if (exists) return exists;

  const genesisData = {
    type: 'genesis',
    message: 'Genesis Block - Crypto Auction Platform Initialized',
    timestamp: new Date(),
  };

  const genesisBlock = await Blockchain.create({
    index: 0,
    timestamp: new Date(),
    data: genesisData,
    previousHash: '0',
    hash: calculateHash(0, new Date(), genesisData, '0'),
    type: 'genesis',
  });

  console.log('✨ Genesis block created');
  return genesisBlock;
};

// Add a new block to the blockchain
export const addBlock = async (type, data) => {
  try {
    // Ensure genesis block exists
    let latestBlock = await getLatestBlock();
    if (!latestBlock) {
      latestBlock = await createGenesisBlock();
    }

    const newIndex = latestBlock.index + 1;
    const timestamp = new Date();
    const previousHash = latestBlock.hash;
    const hash = calculateHash(newIndex, timestamp, data, previousHash);

    const newBlock = await Blockchain.create({
      index: newIndex,
      timestamp,
      data,
      previousHash,
      hash,
      type,
    });

    console.log(`⛓️  New ${type} block added: #${newIndex}`);
    return newBlock;
  } catch (error) {
    console.error('Error adding block:', error);
    throw error;
  }
};

// Validate the entire blockchain
export const validateBlockchain = async () => {
  try {
    const blocks = await Blockchain.find().sort({ index: 1 });

    if (blocks.length === 0) return true;

    // Check genesis block
    if (blocks[0].index !== 0 || blocks[0].previousHash !== '0') {
      return false;
    }

    // Validate each block
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      // Check if current block's previousHash matches previous block's hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Invalid previousHash at block ${i}`);
        return false;
      }

      // Recalculate hash and compare
      const recalculatedHash = calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash
      );

      if (currentBlock.hash !== recalculatedHash) {
        console.error(`Invalid hash at block ${i}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating blockchain:', error);
    return false;
  }
};

// Initialize blockchain with genesis block
export const initializeBlockchain = async () => {
  await createGenesisBlock();
};
