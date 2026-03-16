import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI, bidAPI } from '../../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getMyAuctions();
      setAuctions(response?.data?.auctions || []);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalAuctions = auctions.length;
  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const completedAuctions = auctions.filter(a => a.status === 'completed').length;
  const totalBids = auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0);
  const totalRevenue = auctions.reduce((sum, a) => sum + (a.currentBid || a.basePrice || 0), 0);
  const avgBidsPerAuction = totalAuctions > 0 ? (totalBids / totalAuctions).toFixed(1) : 0;
  const successRate = totalAuctions > 0 ? ((completedAuctions / totalAuctions) * 100).toFixed(1) : 0;

  // Chart data
  const statusData = [
    { name: 'Active', value: activeAuctions, color: '#10b981' },
    { name: 'Completed', value: completedAuctions, color: '#6b7280' },
    { name: 'Pending', value: auctions.filter(a => a.status === 'pending').length, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const revenueByMonth = auctions.reduce((acc, auction) => {
    const month = new Date(auction.createdAt).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    const revenue = auction.currentBid || auction.basePrice || 0;
    
    if (existing) {
      existing.revenue += revenue;
      existing.auctions += 1;
    } else {
      acc.push({ month, revenue, auctions: 1 });
    }
    return acc;
  }, []);

  const topPerformingAuctions = [...auctions]
    .sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0))
    .slice(0, 5)
    .map(a => ({
      name: a.cryptoSymbol,
      bids: a.bidCount || 0,
      revenue: a.currentBid || a.basePrice || 0,
    }));

  const cryptoDistribution = auctions.reduce((acc, auction) => {
    const existing = acc.find(item => item.crypto === auction.cryptoSymbol);
    if (existing) {
      existing.count += 1;
      existing.value += auction.currentBid || auction.basePrice || 0;
    } else {
      acc.push({
        crypto: auction.cryptoSymbol,
        count: 1,
        value: auction.currentBid || auction.basePrice || 0,
      });
    }
    return acc;
  }, []);

  const COLORS = ['#0073ff', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-400 mt-4">Loading analytics...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Detailed insights into your auction performance</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setTimeRange('all')}
            className={`btn text-sm flex-1 sm:flex-none ${timeRange === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Time
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`btn text-sm flex-1 sm:flex-none ${timeRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
          >
            This Month
          </button>
          <button 
            onClick={() => setTimeRange('week')}
            className={`btn text-sm flex-1 sm:flex-none ${timeRange === 'week' ? 'btn-primary' : 'btn-secondary'}`}
          >
            This Week
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💰', change: '+12.5%', color: 'from-green-500 to-emerald-500' },
          { label: 'Total Bids', value: totalBids, icon: '🎯', change: '+8.3%', color: 'from-blue-500 to-cyan-500' },
          { label: 'Avg Bids/Auction', value: avgBidsPerAuction, icon: '📊', change: '+5.1%', color: 'from-purple-500 to-pink-500' },
          { label: 'Success Rate', value: `${successRate}%`, icon: '✅', change: '+2.7%', color: 'from-orange-500 to-red-500' },
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center text-2xl shadow-glow`}>
                {metric.icon}
              </div>
              <span className="text-green-400 text-sm font-semibold">{metric.change}</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{metric.label}</p>
            <p className="text-3xl font-bold text-gray-100">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-200">Revenue Trend</h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2332',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0073ff"
                  strokeWidth={3}
                  dot={{ fill: '#0073ff', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Auction Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-200">Auction Status Distribution</h3>
          <div className="flex items-center justify-center w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  color="#fff"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Performing Auctions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-200">Top Performing Auctions</h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topPerformingAuctions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2332',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="bids" fill="#0073ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crypto Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-200">Cryptocurrency Distribution</h3>
          <div className="space-y-4">
            {cryptoDistribution.map((crypto, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">{crypto.crypto}</span>
                  <span className="text-gray-400 text-xs sm:text-sm">{crypto.count} auctions</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all"
                    style={{
                      width: `${(crypto.value / totalRevenue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs sm:text-sm text-primary-400">${crypto.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-200">Key Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-2xl sm:text-3xl mb-2">📈</div>
            <h4 className="font-semibold text-gray-200 mb-2 text-sm sm:text-base">Best Performance</h4>
            <p className="text-xs sm:text-sm text-gray-400">
              {topPerformingAuctions[0]?.name || 'N/A'} received the most bids with {topPerformingAuctions[0]?.bids || 0} total bids
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-2xl sm:text-3xl mb-2">💎</div>
            <h4 className="font-semibold text-gray-200 mb-2 text-sm sm:text-base">Highest Revenue</h4>
            <p className="text-xs sm:text-sm text-gray-400">
              Your most valuable auction generated ${Math.max(...auctions.map(a => a.currentBid || a.basePrice || 0)).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-2xl sm:text-3xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-200 mb-2 text-sm sm:text-base">Engagement Rate</h4>
            <p className="text-xs sm:text-sm text-gray-400">
              Average of {avgBidsPerAuction} bids per auction shows {avgBidsPerAuction > 5 ? 'excellent' : 'good'} engagement
            </p>
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {auctions.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Data Yet</h3>
          <p className="text-gray-400 mb-6">Create some auctions to see detailed analytics!</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
