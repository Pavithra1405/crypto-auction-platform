import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { blockchainAPI } from '../services/api';

const BlockchainExplorer = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchBlockchain();
    fetchStats();
  }, []);

  const fetchBlockchain = async () => {
    try {
      setLoading(true);
      const response = await blockchainAPI.getAll();
      setBlocks(response.data.blocks);
    } catch (error) {
      toast.error('Failed to fetch blockchain data');
      console.error('Fetch blockchain error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await blockchainAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleDownloadCSV = () => {
    if (blocks.length === 0) {
      toast.error('No blockchain data to download');
      return;
    }

    const headers = ['Index', 'Type', 'Timestamp', 'Hash', 'Previous Hash', 'Data'];

    const rows = blocks.map(block => [
      block.index,
      block.type || block.data?.type || 'N/A',
      new Date(block.timestamp).toLocaleString(),
      block.hash || 'N/A',
      block.previousHash || 'N/A',
      JSON.stringify(block.data).replace(/,/g, ';'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-records-${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Blockchain CSV downloaded successfully!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBlockIcon = (type) => {
    switch (type) {
      case 'genesis': return '🌟';
      case 'auction': return '📦';
      case 'bid': return '💰';
      default: return '⛓️';
    }
  };

  const getBlockColor = (type) => {
    switch (type) {
      case 'genesis': return 'from-purple-500 to-pink-500';
      case 'auction': return 'from-blue-500 to-cyan-500';
      case 'bid': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="section-container py-12">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Blockchain Explorer</h1>
        <p className="text-gray-400 text-lg mb-6">
          Explore the transparent and immutable blockchain ledger
        </p>

        {/* Download CSV Button */}
        <button
          onClick={handleDownloadCSV}
          className="btn btn-primary inline-flex items-center space-x-2"
        >
          <span>⛓️</span>
          <span>Download Blockchain Records (CSV)</span>
        </button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Loading blockchain...</p>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Blocks', value: stats?.totalBlocks || blocks.length, icon: '⛓️' },
            { label: 'Auctions Created', value: stats?.auctionBlocks || blocks.filter(b => b.type === 'auction').length, icon: '📦' },
            { label: 'Bids Placed', value: stats?.bidBlocks || blocks.filter(b => b.type === 'bid').length, icon: '💰' },
            { label: 'Chain Valid', value: stats?.isValid ? '✓ Yes' : '✗ No', icon: stats?.isValid ? '✅' : '❌' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="card text-center"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Blockchain Visualization */}
      {!loading && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {blocks.map((block, index) => (
              <motion.div
                key={block.index}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative"
              >
                {index < blocks.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-6 bg-gradient-to-b from-primary-500 to-transparent"></div>
                )}

                <div
                  onClick={() => setSelectedBlock(block.index === selectedBlock ? null : block.index)}
                  className={`card card-hover cursor-pointer transition-all ${
                    selectedBlock === block.index ? 'border-primary-500 shadow-glow' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br ${getBlockColor(block.data?.type || block.type)} flex items-center justify-center shadow-glow`}>
                      <div className="text-center">
                        <div className="text-2xl">{getBlockIcon(block.data?.type || block.type)}</div>
                        <div className="text-xs font-bold">#{block.index}</div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 capitalize">
                            {block.data?.type === 'genesis' ? 'Genesis Block' :
                             block.data?.type === 'auction' ? `Auction: ${block.data.cryptoName}` :
                             block.data?.type === 'bid' ? `Bid on ${block.data.cryptoSymbol}` :
                             'Block'}
                          </h3>
                          <p className="text-sm text-gray-500">{formatDate(block.timestamp)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          block.data?.type === 'genesis' ? 'bg-purple-900/30 text-purple-400' :
                          block.data?.type === 'auction' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-green-900/30 text-green-400'
                        }`}>
                          {block.data?.type || block.type || 'block'}
                        </span>
                      </div>

                      {!selectedBlock || selectedBlock !== block.index ? (
                        <div className="text-sm text-gray-400">
                          {block.data?.type === 'auction' && (
                            <p>Crypto: {block.data.cryptoName} • Quantity: {block.data.quantity} {block.data.cryptoSymbol}</p>
                          )}
                          {block.data?.type === 'bid' && (
                            <p>Amount: ${block.data.bidAmount?.toLocaleString() || 'N/A'}</p>
                          )}
                          {block.data?.type === 'genesis' && (
                            <p>{block.data.message}</p>
                          )}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-4 space-y-3"
                        >
                          <div className="bg-background-tertiary rounded-lg p-4 space-y-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Block Hash</p>
                              <p className="text-xs font-mono text-primary-400 break-all">{block.hash}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Previous Hash</p>
                              <p className="text-xs font-mono text-gray-400 break-all">{block.previousHash}</p>
                            </div>
                          </div>

                          <div className="bg-background-tertiary rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">Block Data</p>
                            <pre className="text-xs text-gray-300 overflow-x-auto">
                              {JSON.stringify(block.data, null, 2)}
                            </pre>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Timestamp: {block.timestamp}</span>
                            <span>Index: {block.index}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ rotate: selectedBlock === block.index ? 180 : 0 }}
                        className="text-gray-400"
                      >
                        ▼
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {!loading && blocks.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">⛓️</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Blocks Yet</h3>
          <p className="text-gray-400">The blockchain is empty. Create auctions or place bids to add blocks!</p>
        </div>
      )}

      {/* Info Section */}
      {!loading && blocks.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-4xl mx-auto mt-12 card"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-200">How Our Blockchain Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h4 className="font-semibold text-gray-200 mb-2">Immutable Chain</h4>
              <p className="text-sm text-gray-400">
                Each block is cryptographically linked to the previous block, making tampering impossible
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-semibold text-gray-200 mb-2">Secure Hashing</h4>
              <p className="text-sm text-gray-400">
                SHA-256 encryption ensures data integrity and authenticity
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">👁️</div>
              <h4 className="font-semibold text-gray-200 mb-2">Full Transparency</h4>
              <p className="text-sm text-gray-400">
                All transactions are publicly viewable and verifiable
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BlockchainExplorer;
