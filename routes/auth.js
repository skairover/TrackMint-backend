const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();


// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


// ===== Manual Registration =====
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(newUser);
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: "Couldn't create user" });
  }
});

// ===== Manual Login =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('[LOGIN] Received email:', email);

  try {
    const user = await User.findOne({ email });
     console.log('[LOGIN] Fetched user:', user);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.password) {
      return res.status(400).json({ error: 'Please log in with Google instead' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    
    console.log('[LOGIN] Generated token:', token);
    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (err) {
     console.error('[LOGIN] Error:', err.stack || err.message);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// ===== Logout (Frontend handles it now) =====
router.post('/logout', (req, res) => {
  // No more cookies to clear
  return res.status(200).json({ message: 'Logged out successfully (frontend should clear token)' });
});

module.exports = router;
