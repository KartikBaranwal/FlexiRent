const express = require('express');
const router = express.Router();
const { getBundles, getBundleById } = require('../controllers/bundleController');

router.route('/').get(getBundles);
router.route('/:id').get(getBundleById);

module.exports = router;
