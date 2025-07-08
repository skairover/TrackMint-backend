const express = require('express');
const User = require('../models/User');
const auth = require('../Middleware/authMiddleware'); // ✅ import JWT middleware

const router = express.Router();

// PATCH /api/profile
router.patch('/', auth, async (req, res) => {
  const { name, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // ✅ req.user is set by JWT middleware
      { $set: { name, email } },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
