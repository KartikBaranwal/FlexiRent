const express = require('express');
const router = express.Router();
const { getUserTransactions, markAsPaid } = require('../controllers/transactionController');

router.route('/user/:userId').get(getUserTransactions);
router.route('/:id/pay').patch(markAsPaid);

module.exports = router;
