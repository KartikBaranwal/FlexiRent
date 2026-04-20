const Transaction = require('../models/Transaction');

// @desc    Get all transactions for a user
// @route   GET /api/transactions/user/:userId
// @access  Public
const getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a transaction as paid
// @route   PATCH /api/transactions/:id/pay
// @access  Public
const markAsPaid = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    transaction.status = 'paid';
    transaction.paidAt = new Date();
    const updated = await transaction.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserTransactions, markAsPaid };
