import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI, bidAPI, ratingAPI } from '../../services/api';
import RatingModal from '../../components/RatingModal';
import SellerReviewsModal from '../../components/SellerReviewsModal';

const MySwal = withReactContent(Swal);

const bidSchema = z.object({
  bidAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Bid amount must be a positive number',
  }),
});

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [canRate, setCanRate] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSellerReviews, setShowSellerReviews] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();
    checkRatingEligibility();
  }, [id]);

  const checkRatingEligibility = async () => {
    try {
      const response = await ratingAPI.canRateAuction(id);
      const payload = response?.data;

      setCanRate(Boolean(payload?.canRate));
      if (payload?.existingRating) {
        setExistingRating(payload.existingRating);
      } else {
        setExistingRating(null);
      }
    } catch (error) {
      // Eligibility check should never block the auction details UI
      console.error('Check rating eligibility error:', error);
      setCanRate(false);
      setExistingRating(null);
    }
  };

  const handleRatingSubmitted = () => {
    setCanRate(false);
    fetchAuctionDetails(); // Refresh auction to get updated seller rating
    checkRatingEligibility();
  };

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getOne(id);
      setAuction(response?.data?.auction || null);
    } catch (error) {
      toast.error('Failed to fetch auction details');
      console.error('Fetch auction error:', error);
      navigate('/bidder');
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
    return `${hours} hours ago`;
  };

  /* OLD MOCK DATA
  const auction = {
    id: id,
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
    sellerEmail: 'john@example.com',
    timeLeft: '2 days 5 hours',
    description: 'Premium Bitcoin lot available for auction. High-quality crypto asset with verified blockchain history.',
  };
  */

  const chartData = bids.length > 0 
    ? bids.slice().reverse().map((bid, index) => ({
        time: formatTimeAgo(bid.createdAt),
        price: bid.bidAmount,
      }))
    : [{ time: 'Start', price: auction?.basePrice || 0 }];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(bidSchema),
  });

  const onSubmit = async (data) => {
    const bidAmount = parseFloat(data.bidAmount);

    // Client-side guard: never allow bidding on ended/non-active auctions
    const now = new Date();
    const starts = new Date(auction.startDate);
    const ends = new Date(auction.endDate);
    const biddingOpen =
      auction.status === 'active' &&
      now >= starts &&
      now <= ends;

    if (!biddingOpen) {
      toast.error('Bidding is closed for this auction');
      return;
    }

    const highestBidderId = auction?.highestBidder?._id || auction?.highestBidder;
    if (highestBidderId && user?.id && String(highestBidderId) === String(user.id)) {
      MySwal.fire({
        title: 'You are currently the highest bidder',
        text: "You don't need to bid again unless someone places a higher bid than yours.",
        icon: 'info',
        background: '#1a2332',
        color: '#f1f5f9',
        confirmButtonColor: '#0073ff',
      });
      return;
    }

    const currentBid = auction.currentBid || auction.basePrice;

    if (bidAmount <= currentBid) {
      toast.error(`Your bid must be higher than $${currentBid.toLocaleString()}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await bidAPI.placeBid({
        auctionId: auction._id,
        bidAmount: bidAmount,
      });

      MySwal.fire({
        title: 'Bid Placed Successfully!',
        html: `
          <div class="text-left space-y-2">
            <p><strong>Auction:</strong> ${auction.cryptoName} (${auction.cryptoSymbol})</p>
            <p><strong>Your Bid:</strong> $${bidAmount.toLocaleString()}</p>
            <p><strong>Previous Bid:</strong> $${currentBid.toLocaleString()}</p>
            <p class="text-sm text-gray-400 mt-4">✅ Saved to database</p>
            <p class="text-sm text-gray-400">⛓️ Added to blockchain: ${response.data.blockchainHash.substring(0, 16)}...</p>
          </div>
        `,
        icon: 'success',
        background: '#1a2332',
        color: '#f1f5f9',
        confirmButtonColor: '#0073ff',
        confirmButtonText: 'OK',
      });

      toast.success('Bid placed successfully!');
      reset();
      
      // Refresh auction and bids
      await fetchAuctionDetails();
      await fetchBids();
    } catch (error) {
      console.error('Place bid error:', error);
      toast.error(error.message || 'Failed to place bid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <button onClick={() => navigate('/bidder')} className="btn btn-primary mt-4">
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate('/bidder')}
        className="btn btn-secondary mb-6"
      >
        ← Back to Auctions
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
              <div className="bg-green-900/30 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
                Active
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
                  ${(auction.currentBid || auction.basePrice).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
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
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Description</h3>
                <p className="text-gray-400">{auction.description}</p>
              </div>
            )}
          </motion.div>

          {/* Price Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Bidding History</h3>
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

          {/* Recent Bids */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-200">Recent Bids</h3>
            {bids.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No bids yet. Be the first to bid!</p>
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
                      <span className="text-xs text-green-400">Highest Bid</span>
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
          {/* Place Bid Form */}
          {auction.status === 'active' && calculateTimeLeft(auction.endDate) !== 'Ended' ? (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card sticky top-24"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-200">Place Your Bid</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bid Amount (USD)
                </label>
                <input
                  type="text"
                  {...register('bidAmount')}
                  className="input-field"
                  placeholder={`Minimum: $${((auction.currentBid || auction.basePrice) + 100).toLocaleString()}`}
                />
                {errors.bidAmount && (
                  <p className="text-red-400 text-sm mt-1">{errors.bidAmount.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Current bid: ${(auction.currentBid || auction.basePrice).toLocaleString()}
                </p>
              </div>

              <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">⛓️</span>
                  <div className="text-xs text-gray-400">
                    Your bid will be recorded on the blockchain for transparency
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Bid...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">💰</span>
                    Place Bid
                  </>
                )}
              </button>
            </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card sticky top-24"
            >
              <h3 className="text-xl font-semibold mb-3 text-gray-200">Bidding Closed</h3>
              <p className="text-gray-400 text-sm">
                This auction is not accepting bids right now.
              </p>
              <div className="mt-4 bg-background-tertiary border border-border rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-gray-200 font-semibold">{auction.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Ends</span>
                  <span className="text-gray-200 font-semibold">
                    {auction.endDate ? new Date(auction.endDate).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Seller Info */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Seller Information</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-xl font-bold">
                {auction.seller?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <p className="font-semibold text-gray-200">{auction.seller?.name || 'Seller'}</p>
                <p className="text-sm text-gray-500">{auction.seller?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {/* Seller Rating */}
              {auction.seller?.ratingCount > 0 ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rating</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= Math.round(auction.seller.averageRating)
                              ? 'text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-200 font-semibold">
                      {(Number(auction.seller?.averageRating) || 0).toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({auction.seller.ratingCount})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="text-gray-500">No ratings yet</span>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setShowSellerReviews(true)}
                  className="btn btn-secondary w-full"
                  disabled={!auction?.seller?._id}
                >
                  View all reviews
                </button>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since</span>
                <span className="text-gray-200">
                  {auction?.seller?.createdAt
                    ? new Date(auction.seller.createdAt).getFullYear()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Auction Dates */}
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
                <span className="text-gray-400">Quantity</span>
                <span className="text-gray-200">{auction.quantity} {auction.cryptoSymbol}</span>
              </div>
            </div>
          </motion.div>

          {/* Rating Section - Show for completed auctions */}
          {auction.status === 'completed' && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Rate Seller</h3>
              {existingRating ? (
                <div className="space-y-3">
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-green-400 text-xl">✓</span>
                      <span className="text-green-400 font-semibold">Rating Submitted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= existingRating.rating
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-300">{existingRating.rating}.0</span>
                    </div>
                    {existingRating.feedback && (
                      <p className="text-gray-400 text-sm mt-2 italic">
                        "{existingRating.feedback}"
                      </p>
                    )}
                  </div>
                </div>
              ) : canRate ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Share your experience with this seller to help other bidders.
                  </p>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="btn btn-primary w-full"
                  >
                    ⭐ Rate Seller
                  </button>
                </div>
              ) : (
                <div className="bg-background-tertiary rounded-lg p-4 border border-border/50">
                  <p className="text-gray-500 text-sm text-center">
                    Rating not available
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && auction && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          auction={auction}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {showSellerReviews && auction?.seller?._id && (
        <SellerReviewsModal
          sellerId={auction.seller._id}
          sellerName={auction.seller?.name}
          onClose={() => setShowSellerReviews(false)}
        />
      )}
    </div>
  );
};

export default AuctionDetails;
