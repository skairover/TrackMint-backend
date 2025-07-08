const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(helmet());


// ===== CORS (Allow frontend with credentials for cookies if needed) =====
app.use(cors({
  origin: ['http://localhost:5173', 'https://trackmint.vercel.app']
  
}));
const limiter = rateLimit({
  windosMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));         // ✅ Auth route returns JWT now
app.use('/api/expenses', require('./routes/expenses')); // ✅ JWT protected
app.use('/api/incomes', require('./routes/incomes'));   // ✅ JWT protected
app.use('/api/profile', require('./routes/profile'));   // ✅ JWT protected
app.use('/api/user', require('./routes/user'));         // ✅ JWT protected
app.use('/uploads', express.static('uploads'));         // For profile pics

// ===== CONNECT DB & START SERVER =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
