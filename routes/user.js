const express = require('express');
const multer = require('multer')
const path = require('path');
const User = require('../models/User');
const router = express.Router();
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

router.get('/me',isAuthenticated, (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });

  const { name, email, profilePic } = req.user;
  res.json({ name, email, profilePic });
});
router.post('/upload-profile-pic', isAuthenticated, (req, res, next) => {
  const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req2, file, cb) => {
      console.log('REQ.USER in multer:', req2.user); // ✅ now available
      cb(null, req2.user._id + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage }).single('profilePic');

  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

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