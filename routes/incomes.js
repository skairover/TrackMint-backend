 const express = require('express');
 const Income = require('../models/Income');
 const router = express.Router();




const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

router.post('/', isAuthenticated, async (req, res) => {
  const { amount, category, currency } = req.body;

  try {
    const income = new Income({
      amount,
      category,
      currency,
      userId: req.user._id // ✅ Use the session user
    });
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to add income' });
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(incomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const deleted = await Income.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Income not found' });
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

 module.exports = router;