import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Auction API
export const auctionAPI = {
  getAll: (params) => api.get('/auctions', { params }),
  getOne: (id) => api.get(`/auctions/${id}`),
  getMyAuctions: () => api.get('/auctions/my-auctions'),
  create: (data) => api.post('/auctions', data),
  update: (id, data) => api.put(`/auctions/${id}`, data),
  delete: (id) => api.delete(`/auctions/${id}`),
  sendCongrats: (id) => api.post(`/auctions/${id}/send-congrats`),
};

// Bid API
export const bidAPI = {
  placeBid: (data) => api.post('/bids', data),
  getAuctionBids: (auctionId) => api.get(`/bids/auction/${auctionId}`),
  getMyBids: () => api.get('/bids/my-bids'),
  getOne: (id) => api.get(`/bids/${id}`),
};

// Blockchain API
export const blockchainAPI = {
  getAll: (params) => api.get('/blockchain', { params }),
  getOne: (id) => api.get(`/blockchain/${id}`),
  validate: () => api.get('/blockchain/validate'),
  getStats: () => api.get('/blockchain/stats'),
};

// User API
export const userAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Rating API
export const ratingAPI = {
  submitRating: (data) => api.post('/ratings', data),
  getSellerRatings: (sellerId, params) => api.get(`/ratings/seller/${sellerId}`, { params }),
  getMyRatingForAuction: (auctionId) => api.get(`/ratings/auction/${auctionId}/my-rating`),
  canRateAuction: (auctionId) => api.get(`/ratings/auction/${auctionId}/can-rate`),
  getMyRatings: () => api.get('/ratings/my-ratings'),
};

export default api;
