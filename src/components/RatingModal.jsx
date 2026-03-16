import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ratingAPI } from '../services/api';

const RatingModal = ({ isOpen, onClose, auction, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [communication, setCommunication] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      await ratingAPI.submitRating({
        auctionId: auction._id,
        rating,
        feedback,
        communication: communication || rating,
        accuracy: accuracy || rating,
        speed: speed || rating,
      });

      toast.success('Rating submitted successfully!');
      onRatingSubmitted();
      onClose();
      
      // Reset form
      setRating(0);
      setFeedback('');
      setCommunication(0);
      setAccuracy(0);
      setSpeed(0);
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label, hovered, onHover }) => (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <span
              className={`text-3xl ${
                star <= (hovered || value)
                  ? 'text-yellow-400'
                  : 'text-gray-600'
              }`}
            >
              ★
            </span>
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-gray-300 font-semibold">{value}.0</span>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-background-secondary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background-secondary border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Rate Seller</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Share your experience with {auction.seller?.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Auction Info */}
            <div className="bg-background-tertiary rounded-lg p-4 border border-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-lg font-bold">
                  {auction.cryptoSymbol}
                </div>
                <div>
                  <p className="font-semibold text-gray-200">{auction.cryptoName}</p>
                  <p className="text-sm text-gray-500">
                    {auction.quantity} {auction.cryptoSymbol}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="space-y-2">
              <StarRating
                label="Overall Rating *"
                value={rating}
                onChange={setRating}
                hovered={hoveredRating}
                onHover={setHoveredRating}
              />
              {rating > 0 && (
                <p className="text-sm text-gray-500">
                  {rating === 1 && '⭐ Poor'}
                  {rating === 2 && '⭐⭐ Fair'}
                  {rating === 3 && '⭐⭐⭐ Good'}
                  {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                  {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                </p>
              )}
            </div>

            {/* Detailed Ratings */}
            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">
                Detailed Ratings (Optional)
              </h3>
              
              <StarRating
                label="Communication"
                value={communication}
                onChange={setCommunication}
              />

              <StarRating
                label="Item Accuracy"
                value={accuracy}
                onChange={setAccuracy}
              />

              <StarRating
                label="Transaction Speed"
                value={speed}
                onChange={setSpeed}
              />
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Your Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this seller..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Help other bidders make informed decisions</span>
                <span>{feedback.length}/500</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingModal;
