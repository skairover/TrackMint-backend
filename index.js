const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo'); // for storing sessions in MongoDB

dotenv.config();

require('./config/passport'); // Google strategy + passport config

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());

// CORS: Allow your frontend
app.use(cors({
  origin: ['http://localhost:5173','https://trackmint.vercel.app', 'https://trackmint-backend.onrender.com'],
  credentials: true
}));

// ===== SESSION CONFIG =====
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
}
}));

// ===== PASSPORT INIT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/incomes', require('./routes/incomes'))
app.use('/api/profile', require('./routes/profile'));
app.use('/api/user', require('./routes/user'))
app.use('/uploads', express.static('uploads'));


// ===== DB & SERVER =====
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  app.listen(5000, () => console.log('Server running on port 5000'));
})
.catch((err) => console.error('MongoDB connection error:', err));
