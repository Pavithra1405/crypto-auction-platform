import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI, bidAPI } from '../../services/api';

const MySwal = withReactContent(Swal);

const SellerAuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [sendingCongrats, setSendingCongrats] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getOne(id);
      const auctionData = response?.data?.auction;
      
      if (auctionData.seller._id !== user.id) {
        toast.error('This auction does not belong to you');
        navigate('/seller');
        return;
      }
      
      setAuction(auctionData);
    } catch (error) {
      toast.error('Failed to fetch auction details');
      console.error('Fetch auction error:', error);
      navigate('/seller');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await bidAPI.getAuctionBids(id);
      setBids(response?.data?.bids || []);
    } catch (error) {
      console.error('Fetch bids error:', error);
    }
  };

  const handleActivateAuction = async () => {
    try {
      setActivating(true);
      await auctionAPI.update(auction._id, { status: 'active' });
      toast.success('Auction activated successfully!');
      fetchAuctionDetails();
    } catch (error) {
      toast.error('Failed to activate auction');
    } finally {
      setActivating(false);
    }
  };

  const handleSendCongrats = async () => {
    try {
      if (!auction?._id) return;
      setSendingCongrats(true);
      const res = await auctionAPI.sendCongrats(auction._id);
      toast.success(res?.message || 'Congrats email sent');
      setAuction((prev) =>
        prev
          ? {
              ...prev,
              congratsSent: true,
              congratsSentAt: res?.data?.congratsSentAt || new Date().toISOString(),
            }
          : prev
      );
    } catch (error) {
      toast.error(error.message || 'Failed to send congrats email');
    } finally {
      setSendingCongrats(false);
    }
  };

  const calculateTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
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

  const handleCloseAuction = () => {
    MySwal.fire({
      title: 'Close Auction Early?',
      text: 'Are you sure you want to close this auction? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Close It',
      background: '#1a2332',
      color: '#f1f5f9',
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success('Auction closed successfully');
      }
    });
  };

  const chartData = bids.length > 0
    ? bids.slice().reverse().map((bid) => ({
        time: formatTimeAgo(bid.createdAt),
        price: bid.bidAmount,
      }))
    : [{ time: 'Start', price: auction?.basePrice || 0 }];

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-6xl">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Auction Not Found</h3>
          <button onClick={() => navigate('/seller')} className="btn btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentBid = auction.currentBid || auction.basePrice;
  const highestBidder = auction.highestBidder;

  return (
    <div className="max-w-6xl">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate('/seller')}
        className="btn btn-secondary mb-6"
      >
        ← Back to Dashboard
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auction Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center font-bold text-2xl shadow-glow">
                  {auction.cryptoSymbol.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">{auction.cryptoName}</h1>
                  <p className="text-gray-400">{auction.cryptoSymbol} • {auction.quantity} Units</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                auction.status === 'active' ? 'bg-green-900/30 text-green-400' :
                auction.status === 'completed' ? 'bg-gray-700 text-gray-400' :
                'bg-orange-900/30 text-orange-400'
              }`}>
                {auction.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background-tertiary rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Base Price</p>
                <p className="text-2xl font-bold text-gray-100">
                  ${auction.basePrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Current Bid</p>
                <p className="text-2xl font-bold text-primary-400">
                  ${currentBid.toLocaleString()}
                </p>
                {auction.currentBid > auction.basePrice && (
                  <p className="text-sm text-green-400 mt-1">
                    +${(auction.currentBid - auction.basePrice).toLocaleString()} profit
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-sm text-gray-400">Time Remaining</p>
                  <p className="font-bold text-orange-400">{calculateTimeLeft(auction.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-sm text-gray-400">Total Bids</p>
                  <p className="font-bold text-gray-100">{auction.bidCount || 0}</p>
                </div>
              </div>
            </div>

            {auction.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Description</h3>
                <p className="text-gray-400">{auction.description}</p>
              </div>
            )}
          </motion.div>

          {/* Bidding Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Bidding Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2332',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="price" fill="#0073ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bids List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-200">All Bids ({bids.length})</h3>
            {bids.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No bids yet. Share your auction to get more bidders!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bids.map((bid, index) => (
                  <div
                    key={bid._id || index}
                    className="flex items-center justify-between p-4 bg-background-tertiary rounded-lg hover:bg-background-tertiary/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center font-semibold">
                        {bid.bidder?.name?.charAt(0) || 'B'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">{bid.bidder?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{formatTimeAgo(bid.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-400">${bid.bidAmount.toLocaleString()}</p>
                      {index === 0 && (
                        <span className="text-xs text-green-400 font-semibold">✓ Winning Bid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Views</p>
                <p className="text-2xl font-bold text-gray-100">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Unique Bidders</p>
                <p className="text-2xl font-bold text-gray-100">
                  {new Set(bids.map(b => b.bidder?._id)).size}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Bid</p>
                <p className="text-2xl font-bold text-gray-100">
                  ${bids.length > 0
                    ? Math.round(bids.reduce((sum, b) => sum + b.bidAmount, 0) / bids.length).toLocaleString()
                    : '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Bid Increment</p>
                <p className="text-2xl font-bold text-green-400">
                  ${bids.length >= 2
                    ? (bids[0].bidAmount - bids[1].bidAmount).toLocaleString()
                    : '0'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Activate Auction Button - only for pending */}
          {auction.status === 'pending' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Auction Actions</h3>
              <p className="text-sm text-gray-400 mb-4">
                Your auction is pending. Activate it so bidders can start placing bids.
              </p>
              <button
                onClick={handleActivateAuction}
                disabled={activating}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activating ? 'Activating...' : '✅ Activate Auction'}
              </button>
            </motion.div>
          )}

          {/* Close Auction Button - only for active */}
          {auction.status === 'active' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Auction Actions</h3>
              <button
                onClick={handleCloseAuction}
                className="btn w-full bg-red-600 hover:bg-red-700 text-white"
              >
                🔴 Close Auction Early
              </button>
            </motion.div>
          )}

          {/* Winning Bidder */}
          {highestBidder && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Current Winner</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xl font-bold">
                  🏆
                </div>
                <div>
                  <p className="font-semibold text-gray-200">{highestBidder.name}</p>
                  <p className="text-sm text-gray-500">{highestBidder.email}</p>
                </div>
              </div>
              <div className="bg-background-tertiary rounded-lg p-3">
                <p className="text-sm text-gray-400">Winning Bid</p>
                <p className="text-2xl font-bold text-green-400">${currentBid.toLocaleString()}</p>
              </div>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Auction Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Start Date</span>
                <span className="text-gray-200">{new Date(auction.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">End Date</span>
                <span className="text-orange-400 font-semibold">{new Date(auction.endDate).toLocaleDateString()}</span>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-200">{formatTimeAgo(auction.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Blockchain</span>
                <span className="text-primary-400 text-xs font-mono">{auction.blockchainHash?.substring(0, 8)}...</span>
              </div>
            </div>
          </motion.div>

          {/* Congrats email (completed auction) */}
          {auction.status === 'completed' && auction.highestBidder && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Winner Notification</h3>
              {auction.congratsSent ? (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span className="text-green-400 font-semibold">Congrats sent</span>
                  </div>
                  {auction.congratsSentAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Sent at: {new Date(auction.congratsSentAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Send a congratulations email to the winning bidder ({auction.highestBidder.name}).
                  </p>
                  <button
                    onClick={handleSendCongrats}
                    disabled={sendingCongrats}
                    className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingCongrats ? 'Sending...' : 'Send Congrats Email'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAuctionDetails;