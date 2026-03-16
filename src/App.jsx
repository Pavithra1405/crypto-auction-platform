import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import LivePrices from './pages/LivePrices';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import SellerDashboard from './pages/seller/Dashboard';
import CreateAuction from './pages/seller/CreateAuction';
import SellerAuctionDetails from './pages/seller/AuctionDetails';
import Analytics from './pages/seller/Analytics';
import SellerReviews from './pages/seller/Reviews';
import BidderDashboard from './pages/bidder/Dashboard';
import AuctionDetails from './pages/bidder/AuctionDetails';
import MyBids from './pages/bidder/MyBids';
import BlockchainExplorer from './pages/BlockchainExplorer';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="page-container">
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a2332',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#0073ff',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="live-prices" element={<LivePrices />} />
              <Route path="blockchain" element={<BlockchainExplorer />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
            </Route>

            {/* Seller Routes */}
            <Route path="/seller" element={<DashboardLayout role="seller" />}>
              <Route index element={<SellerDashboard />} />
              <Route path="create-auction" element={<CreateAuction />} />
              <Route path="auction/:id" element={<SellerAuctionDetails />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reviews" element={<SellerReviews />} />
            </Route>

            {/* Bidder Routes */}
            <Route path="/bidder" element={<DashboardLayout role="bidder" />}>
              <Route index element={<BidderDashboard />} />
              <Route path="auction/:id" element={<AuctionDetails />} />
              <Route path="my-bids" element={<MyBids />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
