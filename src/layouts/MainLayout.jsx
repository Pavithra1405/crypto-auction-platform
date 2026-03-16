import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gradient-dark-blue">
      {/* Navigation */}
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
              <span className="text-2xl font-bold gradient-text">CryptoAuction</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/blockchain" className="text-gray-300 hover:text-primary-400 transition-colors">
                Blockchain
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to={user.role === 'seller' ? '/seller' : '/bidder'} 
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="text-gray-300 hover:text-primary-400 transition-colors">
                    Login
                  </Link>
                  <Link to="/auth/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-primary-400 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background-secondary border-b border-border"
            >
              <div className="px-4 py-4 space-y-3">
                <Link 
                  to="/blockchain" 
                  onClick={closeMobileMenu}
                  className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
                >
                  Blockchain
                </Link>
                
                {user ? (
                  <>
                    <Link 
                      to={user.role === 'seller' ? '/seller' : '/bidder'} 
                      onClick={closeMobileMenu}
                      className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { logout(); closeMobileMenu(); }} 
                      className="btn btn-secondary w-full mt-4"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/auth/login" 
                      onClick={closeMobileMenu}
                      className="block text-gray-300 hover:text-primary-400 transition-colors py-2"
                    >
                      Login
                    </Link>
                    <div className="h-4"></div>
                    <Link 
                      to="/auth/register" 
                      onClick={closeMobileMenu}
                      className="btn btn-primary w-full"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-background-secondary border-t border-border mt-20">
        <div className="section-container py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 CryptoAuction. Built with MERN Stack & Parcel.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
