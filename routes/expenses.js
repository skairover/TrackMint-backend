const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

// Middleware to protect routes (using Passport session)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

router.post('/', isAuthenticated, async (req, res) => {
  const { amount, category, currency } = req.body;

  try {
    const expense = new Expense({
      amount,
      category,
      currency,
      userId: req.user._id // ✅ Use the session user
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add expense' });
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
