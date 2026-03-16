# 🚀 Crypto Auction Backend API

Complete MERN stack backend with Express.js, MongoDB, and blockchain simulation.

## 📦 Installation

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and configure:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crypto-auction
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:1234
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# Using MongoDB locally
mongod

# Or using MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

This creates:
- 5 test users (2 sellers, 3 bidders)
- 4 crypto auctions
- 9 bids
- Complete blockchain

### 5. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs at: **http://localhost:5000**

## 🎯 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)

### Auctions (`/api/auctions`)
- `GET /` - Get all auctions
- `GET /:id` - Get single auction
- `GET /my-auctions` - Get my auctions (seller only)
- `POST /` - Create auction (seller only)
- `PUT /:id` - Update auction (seller only)
- `DELETE /:id` - Delete auction (seller only)

### Bids (`/api/bids`)
- `POST /` - Place bid (bidder only)
- `GET /auction/:auctionId` - Get auction bids
- `GET /my-bids` - Get my bids (bidder only)
- `GET /:id` - Get single bid

### Blockchain (`/api/blockchain`)
- `GET /` - Get all blocks
- `GET /stats` - Get blockchain statistics
- `GET /validate` - Validate blockchain
- `GET /:id` - Get single block

### Users (`/api/users`)
- `GET /:id` - Get user by ID
- `PUT /profile` - Update profile (protected)

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## 📝 Test Credentials (After Seeding)

**Sellers:**
- john@example.com / password123
- jane@example.com / password123

**Bidders:**
- alice@example.com / password123
- bob@example.com / password123
- charlie@example.com / password123

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'seller' | 'bidder',
  publicKey: String (auto-generated),
  privateKey: String (auto-generated),
  createdAt: Date
}
```

### Auction
```javascript
{
  cryptoName: String,
  cryptoSymbol: String,
  quantity: Number,
  basePrice: Number,
  currentBid: Number,
  startDate: Date,
  endDate: Date,
  description: String,
  seller: ObjectId (ref: User),
  status: 'pending' | 'active' | 'completed' | 'cancelled',
  highestBidder: ObjectId (ref: User),
  bidCount: Number,
  blockchainHash: String
}
```

### Bid
```javascript
{
  auction: ObjectId (ref: Auction),
  bidder: ObjectId (ref: User),
  bidAmount: Number,
  blockchainHash: String,
  status: 'active' | 'outbid' | 'won' | 'lost',
  createdAt: Date
}
```

### Blockchain
```javascript
{
  index: Number (unique),
  timestamp: Date,
  data: Mixed,
  previousHash: String,
  hash: String (SHA-256),
  type: 'genesis' | 'auction' | 'bid'
}
```

## ⛓️ Blockchain Features

- **SHA-256 Hashing** for each block
- **Chain Validation** - verifies integrity
- **Genesis Block** - auto-created on first start
- **Immutable Ledger** - all transactions recorded
- **Transparent** - publicly viewable

## 🔧 Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js   # Auth logic
│   ├── auctionController.js # Auction logic
│   ├── bidController.js     # Bid logic
│   ├── blockchainController.js # Blockchain logic
│   └── userController.js    # User logic
├── middleware/
│   └── auth.js             # JWT verification
├── models/
│   ├── User.js             # User model
│   ├── Auction.js          # Auction model
│   ├── Bid.js              # Bid model
│   └── Blockchain.js       # Blockchain model
├── routes/
│   ├── auth.js             # Auth routes
│   ├── auctions.js         # Auction routes
│   ├── bids.js             # Bid routes
│   ├── blockchain.js       # Blockchain routes
│   └── users.js            # User routes
├── utils/
│   ├── blockchain.js       # Blockchain utilities
│   └── seed.js             # Database seeder
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js               # Entry point
```

## 🧪 Testing API

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","role":"bidder"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get auctions
curl http://localhost:5000/api/auctions
```

### Using Postman/Thunder Client
Import the endpoints above and test!

## 🚀 Deployment

### Environment Variables for Production
```
NODE_ENV=production
MONGODB_URI=<your-atlas-uri>
JWT_SECRET=<strong-secret-key>
CLIENT_URL=<your-frontend-url>
```

### Deploy to Heroku
```bash
heroku create crypto-auction-api
heroku config:set MONGODB_URI=<uri>
heroku config:set JWT_SECRET=<secret>
git push heroku main
```

## 📊 API Response Format

### Success
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variables

## 📈 Performance

- **Indexed queries** for fast lookups
- **Pagination ready** (add `?limit=10&page=1`)
- **Efficient population** of related data
- **Connection pooling** with Mongoose

---

**Backend is ready! Now connect your frontend! 🎉**
