const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

require('../config/passport'); // Ensure passport strategy is loaded

// ===== Google OAuth =====
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // User is authenticated and session is created
    res.redirect('http://localhost:5173'); // Redirect to frontend
  }
);

// ===== Manual Registration (Local Strategy not implemented yet) =====
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: "Couldn't create user" });
  }
});


// ===== Manual Login with Sessions =====
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.password) {
      return res.status(400).json({ error: 'Please log in with Google instead' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: 'Logged in successfully' });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});


// ===== Logout =====
router.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return res.status(500).json({ error: 'Logout failed' }); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // clear session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
