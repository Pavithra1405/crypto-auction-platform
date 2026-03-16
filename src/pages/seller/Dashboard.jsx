import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI } from '../../services/api';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getMyAuctions();
      setAuctions(response?.data?.auctions || []);
    } catch (error) {
      toast.error('Failed to fetch auctions');
      console.error('Fetch auctions error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter auctions based on status
  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'all') return true;
    if (filter === 'active') return auction.status === 'active';
    if (filter === 'completed') return auction.status === 'completed';
    return true;
  });

  // Remove mock data
  /* OLD MOCK DATA
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
      },
      {
        id: '3',
        cryptoName: 'Cardano',
        cryptoSymbol: 'ADA',
        quantity: 1000,
        basePrice: 500,
        currentBid: 650,
        bidCount: 15,
        startDate: '2026-02-08',
        endDate: '2026-02-12',
        status: 'completed',
      },
    ];
    setAuctions(mockAuctions);
  }, []); 
  */

  const stats = [
    {
      label: 'Total Auctions',
      value: auctions.length,
      icon: '📊',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Active Auctions',
      value: auctions.filter(a => a.status === 'active').length,
      icon: '🔥',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Total Bids',
      value: auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0),
      icon: '💰',
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Potential Revenue',
      value: '$' + auctions.reduce((sum, a) => sum + (a.currentBid || a.basePrice || 0), 0).toLocaleString(),
      icon: '💵',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const chartData = auctions.map(a => ({
    name: a.cryptoSymbol,
    bids: a.bidCount || 0,
    value: a.currentBid || a.basePrice,
  }));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Seller Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your crypto auctions</p>
        </div>
        <Link to="/seller/create-auction" className="btn btn-primary whitespace-nowrap">
          <span className="mr-2">➕</span>
          Create New Auction
        </Link>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Loading your auctions...</p>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
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

      {/* Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-200">Auction Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
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
      </motion.div>

      {/* Auctions List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-200">My Auctions ({filteredAuctions.length})</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`btn text-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({auctions.length})
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`btn text-sm ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Active ({auctions.filter(a => a.status === 'active').length})
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`btn text-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed ({auctions.filter(a => a.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Crypto</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Quantity</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Base Price</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Current Bid</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Bids</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">End Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuctions.map((auction) => (
                <tr key={auction.id} className="border-b border-border/50 hover:bg-background-tertiary/30 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold text-gray-200">{auction.cryptoName}</div>
                      <div className="text-sm text-gray-500">{auction.cryptoSymbol}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{auction.quantity}</td>
                  <td className="py-4 px-4 text-gray-300">${auction.basePrice.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className="text-primary-400 font-semibold">
                      ${(auction.currentBid || auction.basePrice).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-primary-900/30 text-primary-400 px-3 py-1 rounded-full text-sm">
                      {auction.bidCount || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      auction.status === 'active' 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{formatDate(auction.endDate)}</td>
                  <td className="py-4 px-4">
                    <Link 
                      to={`/seller/auction/${auction._id}`}
                      className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredAuctions.map((auction) => (
            <div key={auction.id} className="bg-background-tertiary/30 rounded-lg p-4 border border-border/50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-200">{auction.cryptoName}</h4>
                  <p className="text-sm text-gray-500">{auction.cryptoSymbol}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  auction.status === 'active' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {auction.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <p className="text-gray-300">{auction.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Base Price</p>
                  <p className="text-gray-300">${auction.basePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                  <p className="text-primary-400 font-semibold">
                    ${(auction.currentBid || auction.basePrice).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bids</p>
                  <span className="bg-primary-900/30 text-primary-400 px-2 py-1 rounded-full text-xs">
                    {auction.bidCount || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-border/30">
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm text-gray-300">{formatDate(auction.endDate)}</p>
                </div>
                <Link 
                  to={`/seller/auction/${auction._id}`}
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
          {/* Empty State */}
          {filteredAuctions.length === 0 && auctions.length > 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No {filter} Auctions</h3>
              <p className="text-gray-400 mb-6">Try a different filter or create a new auction.</p>
            </div>
          )}

          {auctions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Auctions Yet</h3>
              <p className="text-gray-400 mb-6">Create your first auction to get started!</p>
              <Link to="/seller/create-auction" className="btn btn-primary">
                <span className="mr-2">➕</span>
                Create Auction
              </Link>
            </div>
          )}
      </motion.div>
      </>
      )}
    </div>
  );
};

export default SellerDashboard;
