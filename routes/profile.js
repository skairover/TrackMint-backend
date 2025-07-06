const express = require('express');
const User = require('../models/User');
const router = express.Router();
router.patch('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });

  const { name, email } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id }, // ✅ use the logged-in user from session
      { $set: { name, email } },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
