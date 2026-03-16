import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ratingAPI } from '../../services/api';

const PAGE_SIZE = 10;

const Stars = ({ value = 0 }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${v} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(v) ? 'text-yellow-400' : 'text-gray-600'}>
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-400">{v.toFixed(1)}</span>
    </span>
  );
};

const Reviews = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({ averageRating: 0, ratingCount: 0 });
  const [ratings, setRatings] = useState([]);

  const canPageBack = page > 1;
  const canPageForward = ratings.length === PAGE_SIZE;

  const fetchRatings = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);

      const res = await ratingAPI.getSellerRatings(user.id, {
        page,
        limit: PAGE_SIZE,
      });

      const payload = res?.data;
      setSummary({
        averageRating: payload?.summary?.averageRating ?? 0,
        ratingCount: payload?.summary?.totalRatings ?? 0,
      });
      setRatings(payload?.ratings || []);
    } catch (error) {
      console.error('Fetch seller ratings error:', error);
      toast.error(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, page]);

  const ratingBreakdown = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of ratings) {
      const v = Number(r.rating);
      if (v >= 1 && v <= 5) buckets[v] += 1;
    }
    return buckets;
  }, [ratings]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Ratings & Reviews</h1>
            <p className="text-gray-400">See what bidders are saying about you.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Average Rating</div>
              <div className="text-2xl font-bold text-gray-100">
                {(Number(summary.averageRating) || 0).toFixed(1)}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-700" />
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Reviews</div>
              <div className="text-2xl font-bold text-gray-100">{summary.ratingCount || 0}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Stars value={summary.averageRating} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="bg-background-tertiary border border-border rounded-lg p-3">
              <div className="text-gray-300 font-semibold">{s}★</div>
              <div className="text-gray-500 text-sm">{ratingBreakdown[s]} this page</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-200">Recent Feedback</h2>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => canPageBack && setPage((p) => p - 1)}
              disabled={!canPageBack || loading}
            >
              Prev
            </button>
            <div className="text-sm text-gray-400 px-2">Page {page}</div>
            <button
              className="btn btn-secondary"
              onClick={() => canPageForward && setPage((p) => p + 1)}
              disabled={!canPageForward || loading}
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-gray-400">Loading reviews...</div>
          ) : ratings.length === 0 ? (
            <div className="text-gray-400">No reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r._id} className="bg-background-tertiary border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-gray-200 font-semibold">{r.bidder?.name || 'Bidder'}</div>
                      <div className="text-gray-500 text-sm">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <Stars value={r.rating} />
                  </div>

                  {r.feedback ? (
                    <p className="mt-3 text-gray-300 whitespace-pre-wrap">{r.feedback}</p>
                  ) : (
                    <p className="mt-3 text-gray-500 italic">No written feedback.</p>
                  )}

                  {r.communication || r.accuracy || r.speed ? (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-background-secondary/40 border border-border rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Communication</div>
                        <div className="text-gray-200 font-semibold">{r.communication ?? '—'}</div>
                      </div>
                      <div className="bg-background-secondary/40 border border-border rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Item Accuracy</div>
                        <div className="text-gray-200 font-semibold">{r.accuracy ?? '—'}</div>
                      </div>
                      <div className="bg-background-secondary/40 border border-border rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Transaction Speed</div>
                        <div className="text-gray-200 font-semibold">{r.speed ?? '—'}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Reviews;
