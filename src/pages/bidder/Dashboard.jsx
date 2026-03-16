import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI } from '../../services/api';

const BidderDashboard = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getAll({ status: 'active' });
      const auctions = response?.data?.auctions || [];
      const auctionsData = auctions.map(auction => ({
        id: auction._id,
        cryptoName: auction.cryptoName,
        cryptoSymbol: auction.cryptoSymbol,
        quantity: auction.quantity,
        basePrice: auction.basePrice,
        currentBid: auction.currentBid || auction.basePrice,
        bidCount: auction.bidCount,
        startDate: new Date(auction.startDate).toISOString().split('T')[0],
        endDate: new Date(auction.endDate).toISOString().split('T')[0],
        status: auction.status,
        sellerId: auction.seller._id,
        sellerName: auction.seller.name,
        msLeft: getMsLeft(auction.endDate),
        timeLeft: calculateTimeLeft(auction.endDate),
      }));
      setAuctions(auctionsData);
    } catch (error) {
      toast.error('Failed to fetch auctions');
      console.error('Fetch auctions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMsLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    return Number.isFinite(diff) ? diff : 0;
  };

  const calculateTimeLeft = (endDate) => {
    const diff = getMsLeft(endDate);
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Less than 1 hour';
  };

  // Remove all mock data below
  /* OLD MOCK DATA - REPLACED WITH REAL API
  useEffect(() => {
    const mockAuctions = [
      {
        id: '1',
        cryptoName: 'Bitcoin',
        cryptoSymbol: 'BTC',
        quantity: 0.5,
        basePrice: 25000,
        currentBid: 27500,
        bidCount: 12,
        startDate: '2026-02-10',
        endDate: '2026-02-15',
        status: 'active',
        sellerId: 'seller1',
        sellerName: 'John Doe',
        timeLeft: '2 days',
      },
      {
        id: '2',
        cryptoName: 'Ethereum',
        cryptoSymbol: 'ETH',
        quantity: 10,
        basePrice: 2000,
        currentBid: 2350,
        bidCount: 8,
        startDate: '2026-02-11',
        endDate: '2026-02-16',
        status: 'active',
        sellerId: 'seller2',
        sellerName: 'Jane Smith',
        timeLeft: '3 days',
      },
      {
        id: '3',
        cryptoName: 'Cardano',
        cryptoSymbol: 'ADA',
        quantity: 1000,
        basePrice: 500,
        currentBid: 650,
        bidCount: 15,
        startDate: '2026-02-12',
        endDate: '2026-02-14',
        status: 'active',
        sellerId: 'seller1',
        sellerName: 'John Doe',
        timeLeft: '1 day',
      },
      {
        id: '4',
        cryptoName: 'Solana',
        cryptoSymbol: 'SOL',
        quantity: 50,
        basePrice: 1200,
        currentBid: 1500,
        bidCount: 20,
        startDate: '2026-02-09',
        endDate: '2026-02-13',
        status: 'active',
        sellerId: 'seller3',
        sellerName: 'Bob Wilson',
        timeLeft: '18 hours',
      },
      {
        id: '5',
        cryptoName: 'Ripple',
        cryptoSymbol: 'XRP',
        quantity: 5000,
        basePrice: 800,
        currentBid: 950,
        bidCount: 10,
        startDate: '2026-02-11',
        endDate: '2026-02-17',
        status: 'active',
        sellerId: 'seller2',
        sellerName: 'Jane Smith',
        timeLeft: '4 days',
      },
      {
        id: '6',
        cryptoName: 'Polkadot',
        cryptoSymbol: 'DOT',
        quantity: 200,
        basePrice: 1500,
        currentBid: 1800,
        bidCount: 18,
        startDate: '2026-02-10',
        endDate: '2026-02-15',
        status: 'active',
        sellerId: 'seller3',
        sellerName: 'Bob Wilson',
        timeLeft: '2 days',
      },
    ];
    setAuctions(mockAuctions);
  }, []); 
  */

  const filteredAuctions = filter === 'all' 
    ? auctions 
    : auctions.filter(a => {
        if (filter === 'ending-soon') {
          return a.msLeft > 0 && a.msLeft <= 24 * 60 * 60 * 1000;
        }
        if (filter === 'hot') return a.bidCount >= 15;
        return true;
      });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Active Auctions</h1>
        <p className="text-gray-400">Browse and place bids on live crypto auctions</p>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span className="mr-2">🌐</span>
          All Auctions
        </button>
        <button
          onClick={() => setFilter('hot')}
          className={`btn ${filter === 'hot' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span className="mr-2">🔥</span>
          Hot Auctions
        </button>
        <button
          onClick={() => setFilter('ending-soon')}
          className={`btn ${filter === 'ending-soon' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span className="mr-2">⏰</span>
          Ending Soon
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Available Auctions', value: auctions.length, icon: '📊' },
          { label: 'Active Auctions', value: auctions.filter(a => a.status === 'active').length, icon: '🔥' },
          { label: 'Avg. Competition', value: auctions.length > 0 ? Math.round(auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0) / auctions.length) + ' bids' : '0 bids', icon: '🏆' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Loading auctions...</p>
        </div>
      )}

      {/* Auctions Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction, index) => (
          <motion.div
            key={auction.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            data-aos="fade-up"
            data-aos-delay={index * 50}
            className="card card-hover group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center font-bold text-lg shadow-glow">
                  {auction.cryptoSymbol.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{auction.cryptoName}</h3>
                  <p className="text-sm text-gray-500">{auction.cryptoSymbol}</p>
                </div>
              </div>
              <div className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                Active
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Quantity</span>
                <span className="text-gray-100 font-semibold">{auction.quantity} {auction.cryptoSymbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Base Price</span>
                <span className="text-gray-100">${auction.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Current Bid</span>
                <span className="text-primary-400 font-bold text-lg">
                  ${auction.currentBid.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Bids</span>
                <span className="bg-primary-900/30 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {auction.bidCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Time Left</span>
                <span className="text-orange-400 font-semibold">{auction.timeLeft}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-background-tertiary rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center text-sm">
                  {auction.sellerName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-sm text-gray-300 font-medium">{auction.sellerName}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link
              to={`/bidder/auction/${auction.id}`}
              className="btn btn-primary w-full group-hover:shadow-glow-lg transition-all"
            >
              <span className="mr-2">💰</span>
              Place Bid
            </Link>
          </motion.div>
        ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAuctions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Auctions Found</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'No active auctions available. Sellers can create auctions from their dashboard.' 
              : 'Try adjusting your filters or check back later.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BidderDashboard;
