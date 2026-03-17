import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { bidAPI } from '../../services/api';

const MyBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const response = await bidAPI.getMyBids();
      setBids(response?.data?.bids || []);
    } catch (error) {
      toast.error('Failed to fetch your bids');
      console.error('Fetch bids error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBids = async () => {
    try {
      const response = await bidAPI.getMyBids();
      setBids(response?.data?.bids || []);
      toast.success('Bids updated!');
    } catch (error) {
      toast.error('Failed to refresh bids');
      console.error('Refresh bids error:', error);
    }
  };

  const handleDownloadCSV = () => {
    if (bids.length === 0) {
      toast.error('No bids to download');
      return;
    }

    const headers = ['Auction', 'Symbol', 'My Bid ($)', 'Current Bid ($)', 'Status', 'Auction Status', 'Bid Time'];

    const rows = bids.map(bid => [
      bid.auction?.cryptoName || 'N/A',
      bid.auction?.cryptoSymbol || 'N/A',
      bid.bidAmount,
      bid.auction?.currentBid || 0,
      bid.status,
      bid.auction?.status || 'N/A',
      new Date(bid.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-bids-${user?.name || 'bidder'}-${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully!');
  };

  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const myMaxBidByAuction = bids.reduce((acc, bid) => {
    const auctionId = bid.auction?._id;
    if (!auctionId) return acc;
    const amount = Number(bid.bidAmount);
    if (!Number.isFinite(amount)) return acc;
    acc[auctionId] = Math.max(acc[auctionId] ?? 0, amount);
    return acc;
  }, {});

  const isBidWinning = (bid) => {
    const auctionId = bid.auction?._id;
    const currentBid = Number(bid.auction?.currentBid);
    const myMaxBid = myMaxBidByAuction[auctionId] ?? 0;
    return (
      Boolean(auctionId) &&
      bid.auction?.status === 'active' &&
      Number.isFinite(currentBid) &&
      currentBid > 0 &&
      myMaxBid === currentBid &&
      Number(bid.bidAmount) === myMaxBid
    );
  };

  const totalBids = bids.length;
  const totalSpent = bids.reduce((sum, bid) => sum + bid.bidAmount, 0);
  const wonBids = bids.filter(bid => bid.status === 'won').length;
  const outbidCount = bids.filter(bid => bid.status === 'outbid').length;

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    if (filter === 'won') return bid.status === 'won';
    if (filter === 'outbid') return bid.status === 'outbid';
    if (filter === 'lost') return bid.status === 'lost';
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-400 mt-4">Loading your bids...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">My Bids</h1>
          <p className="text-gray-400 text-sm sm:text-base">Track all your bidding activity</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshBids}
            className="btn btn-secondary whitespace-nowrap"
            title="Refresh bids data"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </button>
          <button
            onClick={handleDownloadCSV}
            className="btn btn-primary whitespace-nowrap"
            title="Download bid history as CSV"
          >
            <span className="mr-2">📥</span>
            Download CSV
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Bids', value: totalBids, icon: '🎯', color: 'from-blue-500 to-cyan-500' },
          { label: 'Won Auctions', value: wonBids, icon: '🏆', color: 'from-yellow-500 to-orange-500' },
          { label: 'Outbid', value: outbidCount, icon: '📉', color: 'from-red-500 to-pink-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2 sm:gap-3"
      >
        <button
          onClick={() => setFilter('all')}
          className={`btn text-sm flex-1 sm:flex-none ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Bids ({totalBids})
        </button>
        <button
          onClick={() => setFilter('won')}
          className={`btn text-sm flex-1 sm:flex-none ${filter === 'won' ? 'btn-primary' : 'btn-secondary'}`}
        >
          🏆 Won ({wonBids})
        </button>
        <button
          onClick={() => setFilter('outbid')}
          className={`btn text-sm flex-1 sm:flex-none ${filter === 'outbid' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📉 Outbid ({outbidCount})
        </button>
      </motion.div>

      {/* Bids List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-200">
          {filter === 'all' ? 'All Bids' :
           filter === 'won' ? 'Won Auctions' :
           filter === 'outbid' ? 'Outbid' : 'Filtered Bids'} ({filteredBids.length})
        </h3>

        {filteredBids.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'all' ? '🎯' : filter === 'won' ? '🏆' : '📉'}
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No {filter === 'all' ? 'Bids' : filter === 'won' ? 'Won Auctions' : 'Outbid'} Yet
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all'
                ? 'Browse auctions and place your first bid!'
                : filter === 'won'
                ? "You haven't won any auctions yet. Keep bidding!"
                : 'All your bids are still active!'}
            </p>
            {filter === 'all' && (
              <Link to="/bidder" className="btn btn-primary">
                Browse Auctions
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Auction</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">My Bid</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Current Bid</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Auction Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBids.map((bid) => {
                    const auctionEnded = bid.auction?.status === 'completed';
                    const isWinning = isBidWinning(bid);
                    return (
                      <tr key={bid._id} className="border-b border-border/50 hover:bg-background-tertiary/30 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-gray-200">{bid.auction?.cryptoName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{bid.auction?.cryptoSymbol || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-primary-400 font-bold">${bid.bidAmount.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">${(bid.auction?.currentBid || 0).toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            bid.status === 'won' ? 'bg-green-900/30 text-green-400' :
                            bid.status === 'lost' ? 'bg-red-900/30 text-red-400' :
                            isWinning ? 'bg-green-900/30 text-green-400' :
                            bid.status === 'outbid' ? 'bg-red-900/30 text-red-400' :
                            auctionEnded ? 'bg-gray-700 text-gray-400' :
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {bid.status === 'won' ? '🏆 Won' :
                             bid.status === 'lost' ? '❌ Lost' :
                             isWinning ? '🏆 Winning' :
                             bid.status === 'outbid' ? '📉 Outbid' :
                             auctionEnded ? 'Ended' : bid.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-gray-300 text-sm">{formatTimeAgo(bid.createdAt)}</div>
                            {bid.auction?.endDate && (
                              <div className="text-xs text-gray-500">
                                {calculateTimeLeft(bid.auction.endDate) === 'Ended'
                                  ? 'Ended'
                                  : `${calculateTimeLeft(bid.auction.endDate)} left`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            bid.auction?.status === 'active'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {bid.auction?.status || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {bid.auction && (
                            <Link
                              to={`/bidder/auction/${bid.auction._id}`}
                              className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                            >
                              View Auction →
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredBids.map((bid) => {
                const auctionEnded = bid.auction?.status === 'completed';
                const isWinning = isBidWinning(bid);
                return (
                  <div key={bid._id} className="bg-background-tertiary/30 rounded-lg p-4 border border-border/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-200">{bid.auction?.cryptoName || 'N/A'}</h4>
                        <p className="text-sm text-gray-500">{bid.auction?.cryptoSymbol || 'N/A'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bid.status === 'won' ? 'bg-green-900/30 text-green-400' :
                        bid.status === 'lost' ? 'bg-red-900/30 text-red-400' :
                        isWinning ? 'bg-green-900/30 text-green-400' :
                        bid.status === 'outbid' ? 'bg-red-900/30 text-red-400' :
                        auctionEnded ? 'bg-gray-700 text-gray-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {bid.status === 'won' ? '🏆 Won' :
                         bid.status === 'lost' ? '❌ Lost' :
                         isWinning ? '🏆 Winning' :
                         bid.status === 'outbid' ? '📉 Outbid' :
                         auctionEnded ? 'Ended' : bid.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">My Bid</p>
                        <p className="text-primary-400 font-bold">${bid.bidAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                        <p className="text-gray-300">${(bid.auction?.currentBid || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Bid Time</p>
                        <p className="text-gray-300 text-sm">{formatTimeAgo(bid.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time Left</p>
                        <p className="text-gray-300 text-sm">
                          {bid.auction?.endDate ? (
                            calculateTimeLeft(bid.auction.endDate) === 'Ended'
                              ? 'Ended'
                              : `${calculateTimeLeft(bid.auction.endDate)} left`
                          ) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border/30">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bid.auction?.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {bid.auction?.status || 'N/A'}
                      </span>
                      {bid.auction && (
                        <Link
                          to={`/bidder/auction/${bid.auction._id}`}
                          className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                        >
                          View Auction →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {bids.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Bids Yet</h3>
          <p className="text-gray-400 mb-6">Start bidding on auctions to track your activity here!</p>
          <Link to="/bidder" className="btn btn-primary">
            Browse Auctions
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyBids;
