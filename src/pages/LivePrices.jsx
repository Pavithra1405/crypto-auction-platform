import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LivePrices = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');

  const cryptos = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', icon: '₳' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◎' },
    { id: 'ripple', name: 'Ripple', symbol: 'XRP', icon: '✕' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', icon: '●' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark-blue">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="section-container py-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Live Crypto Prices
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time cryptocurrency prices and charts for all major digital assets
          </p>
        </div>

        {/* Crypto Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {cryptos.map((crypto, index) => (
            <motion.button
              key={crypto.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCrypto(crypto.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedCrypto === crypto.id
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'bg-background-secondary text-gray-400 hover:text-gray-200 hover:bg-background-tertiary'
              }`}
            >
              <span className="text-xl">{crypto.icon}</span>
              <div className="text-left">
                <div className="text-sm font-bold">{crypto.symbol}</div>
                <div className="text-xs opacity-75 hidden sm:block">{crypto.name}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Price Chart */}
        <motion.div
          key={selectedCrypto}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card max-w-6xl mx-auto"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-200 mb-2">
              {cryptos.find(c => c.id === selectedCrypto)?.name} ({cryptos.find(c => c.id === selectedCrypto)?.symbol})
            </h2>
            <p className="text-gray-400">Live price chart and market data</p>
          </div>

          <div className="relative overflow-hidden rounded-xl">
            <iframe
              src={`https://charts.bitcoin.com/embed/widgets/live-price.html?coin=${selectedCrypto}&theme=auto`}
              width="100%"
              height="440"
              frameBorder="0"
              style={{ borderRadius: '12px' }}
              title={`${cryptos.find(c => c.id === selectedCrypto)?.name} Live Price Chart`}
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card text-center"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Real-Time Data</h3>
            <p className="text-gray-400 text-sm">
              Live cryptocurrency prices updated in real-time from multiple exchanges
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card text-center"
          >
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Interactive Charts</h3>
            <p className="text-gray-400 text-sm">
              Detailed price charts with technical indicators and market analysis
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card text-center"
          >
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Market Insights</h3>
            <p className="text-gray-400 text-sm">
              Comprehensive market data including volume, market cap, and price changes
            </p>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-200 mb-4">
              Ready to Start Trading?
            </h3>
            <p className="text-gray-400 mb-6">
              Join our crypto auction platform and start bidding on your favorite cryptocurrencies
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="btn btn-primary"
              >
                Get Started
              </a>
              <a
                href="/"
                className="btn btn-secondary"
              >
                Back to Home
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LivePrices;