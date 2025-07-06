const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'DZD'
  },
  category: {
    type: String,
    required: true,
   
  },
      userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}

}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
