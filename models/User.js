const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional if only Google
  profilePic: { type: String }, // ✅ add this
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);