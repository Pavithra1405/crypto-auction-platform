import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const sellerLinks = [
    { path: '/seller', label: 'Dashboard', icon: '📊' },
    { path: '/seller/create-auction', label: 'Create Auction', icon: '➕' },
    { path: '/seller/analytics', label: 'Analytics', icon: '📈' },
    { path: '/seller/reviews', label: 'Reviews', icon: '⭐' },
  ];

  const bidderLinks = [
    { path: '/bidder', label: 'Active Auctions', icon: '🔥' },
    { path: '/bidder/my-bids', label: 'My Bids', icon: '💰' },
  ];

  const links = role === 'seller' ? sellerLinks : bidderLinks;

  return (
    <div className="min-h-screen bg-gradient-dark-blue">
      {/* Top Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-background-secondary/80 backdrop-blur-md border-b border-border sticky top-0 z-50"
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔷</span>
              </div>
              <span className="text-xl md:text-2xl font-bold gradient-text">CryptoAuction</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-gray-300">
                <span className="text-gray-500">Welcome,</span>{' '}
                <span className="text-primary-400 font-semibold">{user.name}</span>
              </div>
              <Link to="/blockchain" className="text-gray-300 hover:text-primary-400 transition-colors">
                Blockchain
              </Link>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <span className="text-gray-400 text-sm">{user.name}</span>
              <button onClick={logout} className="btn btn-secondary text-sm py-2 px-3">
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="section-container">
        <div className="flex gap-6 py-8">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-50 btn btn-primary p-4 rounded-full shadow-lg"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Mobile Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <aside
            className={`w-64 flex-shrink-0 fixed lg:sticky top-16 lg:top-24 left-0 h-[calc(100vh-4rem)] z-40 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="card sticky top-24">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  {role === 'seller' ? 'Seller Panel' : 'Bidder Panel'}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              
              <nav className="space-y-2">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      location.pathname === link.path
                        ? 'bg-gradient-primary text-white shadow-glow'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-background-tertiary'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main
            className="flex-1 min-w-0 pb-20 lg:pb-0 w-full lg:w-auto"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
