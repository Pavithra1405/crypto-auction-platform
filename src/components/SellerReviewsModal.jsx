import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ratingAPI } from '../services/api';

const Stars = ({ value = 0 }) => {
  const rounded = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rounded ? 'text-yellow-400' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </div>
  );
};

const SellerReviewsModal = ({ sellerId, sellerName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalRatings: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const limit = 10;

  const fetchRatings = async (page = 1) => {
    try {
      setLoading(true);
      const res = await ratingAPI.getSellerRatings(sellerId, { page, limit });
      const payload = res?.data || {};

      setRatings(payload.ratings || []);
      setSummary(payload.summary || { averageRating: 0, totalRatings: 0 });
      setPagination(payload.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Fetch seller ratings error:', err);
      toast.error(err.message || 'Failed to load seller reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sellerId) return;
    fetchRatings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const page = pagination.page || 1;
  const pages = pagination.pages || 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-3xl bg-background-secondary border border-border rounded-2xl shadow-xl"
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">{sellerName || 'Seller'} Reviews</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                <Stars value={summary.averageRating} />
                <span className="text-gray-200 font-semibold">
                  {(Number(summary.averageRating) || 0).toFixed(1)}
                </span>
                <span>({summary.totalRatings || 0} reviews)</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">✕</button>
          </div>

          <div className="px-6 py-5 max-h-[70vh] overflow-auto">
            {loading ? (
              <div className="text-center text-gray-400 py-10">Loading reviews...</div>
            ) : ratings.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No reviews yet.</div>
            ) : (
              <div className="space-y-4">
                {ratings.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl border border-border bg-background-tertiary">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Stars value={r.rating} />
                        <span className="text-gray-200 font-semibold">{r.rating}.0</span>
                        <span className="text-gray-500 text-sm">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        by {r.bidder?.name || 'Bidder'}
                      </span>
                    </div>

                    {r.feedback ? (
                      <p className="mt-3 text-gray-300">{r.feedback}</p>
                    ) : (
                      <p className="mt-3 text-gray-500 italic">No written feedback.</p>
                    )}

                    {(r.communication || r.accuracy || r.speed) && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        {typeof r.communication === 'number' && (
                          <div className="flex justify-between p-2 rounded bg-black/20 border border-border">
                            <span className="text-gray-400">Communication</span>
                            <span className="text-gray-200">{r.communication}/5</span>
                          </div>
                        )}
                        {typeof r.accuracy === 'number' && (
                          <div className="flex justify-between p-2 rounded bg-black/20 border border-border">
                            <span className="text-gray-400">Accuracy</span>
                            <span className="text-gray-200">{r.accuracy}/5</span>
                          </div>
                        )}
                        {typeof r.speed === 'number' && (
                          <div className="flex justify-between p-2 rounded bg-black/20 border border-border">
                            <span className="text-gray-400">Speed</span>
                            <span className="text-gray-200">{r.speed}/5</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <button
              className="btn btn-secondary"
              disabled={loading || page <= 1}
              onClick={() => fetchRatings(page - 1)}
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {pages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={loading || page >= pages}
              onClick={() => fetchRatings(page + 1)}
            >
              Next
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SellerReviewsModal;
