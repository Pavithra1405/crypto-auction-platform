import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Blockchain from '../models/Blockchain.js';
import { initializeBlockchain, addBlock } from './blockchain.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});
    await Blockchain.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Initialize blockchain with genesis block
    await initializeBlockchain();

    // Create users
    const seller1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'seller',
    });

    const seller2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'seller',
    });

    const bidder1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'bidder',
    });

    const bidder2 = await User.create({
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: 'password123',
      role: 'bidder',
    });

    const bidder3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'bidder',
    });

    console.log('👥 Created 5 users (2 sellers, 3 bidders)');

    // Create auctions
    const auctionsData = [
      {
        cryptoName: 'Bitcoin',
        cryptoSymbol: 'BTC',
        quantity: 0.5,
        basePrice: 25000,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        description: 'Premium Bitcoin lot available for auction',
        seller: seller1._id,
      },
      {
        cryptoName: 'Ethereum',
        cryptoSymbol: 'ETH',
        quantity: 10,
        basePrice: 2000,
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        description: 'High-quality Ethereum tokens',
        seller: seller2._id,
      },
      {
        cryptoName: 'Cardano',
        cryptoSymbol: 'ADA',
        quantity: 1000,
        basePrice: 500,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        description: 'Large Cardano lot',
        seller: seller1._id,
      },
      {
        cryptoName: 'Solana',
        cryptoSymbol: 'SOL',
        quantity: 50,
        basePrice: 1200,
        startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        description: 'Solana tokens at great price',
        seller: seller2._id,
      },
    ];

    const auctions = [];
    for (const auctionData of auctionsData) {
      const block = await addBlock('auction', auctionData);
      const auction = await Auction.create({
        ...auctionData,
        blockchainHash: block.hash,
      });
      auctions.push(auction);
    }

    console.log('📦 Created 4 auctions');

    // Create bids
    const bidsData = [
      { auction: auctions[0]._id, bidder: bidder1._id, bidAmount: 25500 },
      { auction: auctions[0]._id, bidder: bidder2._id, bidAmount: 26000 },
      { auction: auctions[0]._id, bidder: bidder3._id, bidAmount: 27500 },
      { auction: auctions[1]._id, bidder: bidder1._id, bidAmount: 2100 },
      { auction: auctions[1]._id, bidder: bidder2._id, bidAmount: 2350 },
      { auction: auctions[2]._id, bidder: bidder3._id, bidAmount: 550 },
      { auction: auctions[2]._id, bidder: bidder1._id, bidAmount: 650 },
      { auction: auctions[3]._id, bidder: bidder2._id, bidAmount: 1300 },
      { auction: auctions[3]._id, bidder: bidder3._id, bidAmount: 1500 },
    ];

    for (const bidData of bidsData) {
      const auction = await Auction.findById(bidData.auction);
      const block = await addBlock('bid', {
        ...bidData,
        cryptoSymbol: auction.cryptoSymbol,
      });

      await Bid.create({
        ...bidData,
        blockchainHash: block.hash,
      });

      // Update auction
      auction.currentBid = bidData.bidAmount;
      auction.highestBidder = bidData.bidder;
      auction.bidCount += 1;
      await auction.save();
    }

    console.log('💰 Created 9 bids');
    console.log('⛓️  Blockchain has', await Blockchain.countDocuments(), 'blocks');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Seller: john@example.com / password123');
    console.log('Seller: jane@example.com / password123');
    console.log('Bidder: alice@example.com / password123');
    console.log('Bidder: bob@example.com / password123');
    console.log('Bidder: charlie@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
