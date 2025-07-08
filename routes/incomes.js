const express = require('express');
const Income = require('../models/Income');
const auth = require('../Middleware/authMiddleware'); // ✅ Import JWT middleware

const router = express.Router();

// Add income
router.post('/', auth, async (req, res) => {
  const { amount, category, currency } = req.body;

  try {
    const income = new Income({
      amount,
      category,
      currency,
      userId: req.user._id // ✅ Comes from JWT middleware
    });
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add income' });
  }
});

// Get incomes
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(incomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// Delete income
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) return res.status(404).json({ error: 'Income not found' });
    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: You cannot delete this income' });
    }

    await income.deleteOne();
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

module.exports = router;
