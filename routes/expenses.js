const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../Middleware/authMiddleware'); // ✅ JWT middleware

const router = express.Router();

// POST: Add expense
router.post('/', auth, async (req, res) => {
  const { amount, category, currency } = req.body;

  try {
    const expense = new Expense({
      amount,
      category,
      currency,
      userId: req.user._id // ✅ Provided by JWT middleware
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add expense' });
  }
});

// GET: Fetch expenses
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// DELETE: Remove expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: You cannot delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
