const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../Middleware/authMiddleware'); // ⬅️ your JWT auth middleware
const router = express.Router();

// ===== GET USER INFO =====
router.get('/me', auth, (req, res) => {
  const { name, email, profilePic } = req.user;
  res.json({ name, email, profilePic });
});

// ===== UPLOAD PROFILE PIC =====
router.post('/upload-profile-pic', auth, (req, res) => {
  const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req2, file, cb) => {
      cb(null, req.user._id + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage }).single('profilePic');

  upload(req, res, async function (err) {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePic: `/uploads/${req.file.filename}` },
        { new: true }
      );
      res.json({ profilePic: user.profilePic });
    } catch (err) {
      res.status(500).json({ error: 'Could not update profile picture' });
    }
  });
});

module.exports = router;
