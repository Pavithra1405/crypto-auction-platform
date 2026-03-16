import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CryptoJS from 'crypto-js';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['seller', 'bidder']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'bidder',
    },
  });

  const generateKeys = () => {
    const publicKey = CryptoJS.lib.WordArray.random(32).toString();
    const privateKey = CryptoJS.lib.WordArray.random(32).toString();
    return { publicKey, privateKey };
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        toast.success(`Successfully registered as ${data.role}!`);
        navigate(data.role === 'seller' ? '/seller' : '/bidder');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = watch('role');

  return (
    <div>
      {/* Back to Home Button */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-6"
      >
        <Link to="/" className="btn btn-secondary inline-flex items-center">
          ← Back to Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card"
      >
        {/* Header */}
        <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow">
          <span className="text-3xl">🔷</span>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
        <p className="text-gray-400">Join the crypto auction platform</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            I want to register as:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative cursor-pointer">
              <input
                type="radio"
                value="bidder"
                {...register('role')}
                className="peer sr-only"
              />
              <div className="card card-hover peer-checked:border-primary-500 peer-checked:shadow-glow text-center">
                <span className="text-4xl mb-2 block">💰</span>
                <span className="font-semibold">Bidder</span>
                <p className="text-xs text-gray-500 mt-1">Place bids on auctions</p>
              </div>
            </label>

            <label className="relative cursor-pointer">
              <input
                type="radio"
                value="seller"
                {...register('role')}
                className="peer sr-only"
              />
              <div className="card card-hover peer-checked:border-primary-500 peer-checked:shadow-glow text-center">
                <span className="text-4xl mb-2 block">🏪</span>
                <span className="font-semibold">Seller</span>
                <p className="text-xs text-gray-500 mt-1">Create auctions</p>
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="text-red-400 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            {...register('name')}
            className="input-field"
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register('email')}
            className="input-field"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            {...register('password')}
            className="input-field"
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="input-field"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-xl">🔐</span>
            <div className="text-sm text-gray-300">
              <p className="font-semibold mb-1">Blockchain Keys</p>
              <p className="text-gray-400">
                Public and private keys will be automatically generated for your account
                to enable secure blockchain transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary-400 hover:text-primary-300 font-semibold">
            Sign In
          </Link>
        </div>
      </form>
      </motion.div>
    </div>
  );
};

export default Register;
