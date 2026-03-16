import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../../context/AuthContext';
import { auctionAPI } from '../../services/api';

const MySwal = withReactContent(Swal);

const auctionSchema = z.object({
  cryptoName: z.string().min(2, 'Crypto name is required'),
  cryptoSymbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  quantity: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Quantity must be a positive number',
  }),
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Base price must be a positive number',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(auctionSchema),
  });

  const popularCryptos = [
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { name: 'Cardano', symbol: 'ADA', icon: '₳' },
    { name: 'Solana', symbol: 'SOL', icon: '◎' },
    { name: 'Ripple', symbol: 'XRP', icon: '✕' },
    { name: 'Polkadot', symbol: 'DOT', icon: '●' },
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Prepare auction data
      const auctionData = {
        cryptoName: data.cryptoName,
        cryptoSymbol: data.cryptoSymbol.toUpperCase(),
        quantity: parseFloat(data.quantity),
        basePrice: parseFloat(data.basePrice),
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description || '',
      };

      // Create auction via API
      const response = await auctionAPI.create(auctionData);
      const createdAuction = response.data.auction;

      // Show success modal
      MySwal.fire({
        title: 'Auction Created!',
        html: `
          <div class="text-left space-y-2">
            <p><strong>Crypto:</strong> ${createdAuction.cryptoName} (${createdAuction.cryptoSymbol})</p>
            <p><strong>Quantity:</strong> ${createdAuction.quantity}</p>
            <p><strong>Base Price:</strong> $${createdAuction.basePrice.toLocaleString()}</p>
            <p><strong>Duration:</strong> ${data.startDate} to ${data.endDate}</p>
            <p class="text-sm text-gray-400 mt-4">✅ Saved to database</p>
            <p class="text-sm text-gray-400">⛓️ Added to blockchain: ${response.data.blockchainHash.substring(0, 16)}...</p>
          </div>
        `,
        icon: 'success',
        background: '#1a2332',
        color: '#f1f5f9',
        confirmButtonColor: '#0073ff',
        confirmButtonText: 'View Dashboard',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/seller');
        }
      });

      toast.success('Auction created and added to blockchain!');
      reset();
    } catch (error) {
      console.error('Create auction error:', error);
      toast.error(error.message || 'Failed to create auction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCrypto = (crypto) => {
    document.querySelector('input[name="cryptoName"]').value = crypto.name;
    document.querySelector('input[name="cryptoSymbol"]').value = crypto.symbol;
  };

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Create New Auction</h1>
        <p className="text-gray-400">List your cryptocurrency for auction</p>
      </motion.div>

      {/* Quick Select Cryptos */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Select Crypto</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularCryptos.map((crypto) => (
            <button
              key={crypto.symbol}
              type="button"
              onClick={() => fillQuickCrypto(crypto)}
              className="card card-hover text-center py-4 transition-all"
            >
              <div className="text-3xl mb-2">{crypto.icon}</div>
              <div className="text-sm font-semibold text-gray-300">{crypto.symbol}</div>
              <div className="text-xs text-gray-500">{crypto.name}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Crypto Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cryptocurrency Name *
              </label>
              <input
                type="text"
                {...register('cryptoName')}
                className="input-field"
                placeholder="e.g., Bitcoin"
              />
              {errors.cryptoName && (
                <p className="text-red-400 text-sm mt-1">{errors.cryptoName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbol *
              </label>
              <input
                type="text"
                {...register('cryptoSymbol')}
                className="input-field"
                placeholder="e.g., BTC"
              />
              {errors.cryptoSymbol && (
                <p className="text-red-400 text-sm mt-1">{errors.cryptoSymbol.message}</p>
              )}
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity *
              </label>
              <input
                type="text"
                {...register('quantity')}
                className="input-field"
                placeholder="e.g., 0.5"
              />
              {errors.quantity && (
                <p className="text-red-400 text-sm mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Base Price (USD) *
              </label>
              <input
                type="text"
                {...register('basePrice')}
                className="input-field"
                placeholder="e.g., 25000"
              />
              {errors.basePrice && (
                <p className="text-red-400 text-sm mt-1">{errors.basePrice.message}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="input-field"
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="input-field"
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows="4"
              placeholder="Add any additional details about this auction..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-xl">⛓️</span>
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-1">Blockchain Transaction</p>
                <p className="text-gray-400">
                  When you create this auction, a new block will be added to the blockchain
                  containing all auction details. This ensures transparency and immutability.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Auction...
                </span>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Create Auction
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAuction;
