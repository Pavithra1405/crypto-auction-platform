import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './server/routes/auth.js';
import auctionsRoutes from './server/routes/auctions.js';
import bidsRoutes from './server/routes/bids.js';
import blockchainRoutes from './server/routes/blockchain.js';
import ratingsRoutes from './server/routes/ratings.js';
import usersRoutes from './server/routes/users.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend working 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/users', usersRoutes);

app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
});