const express = require('express');
const router = express.Router();
const { getProducts, getProductById, updateProduct } = require('../controllers/productController');

router.route('/').get(getProducts);
router.route('/:id').get(getProductById).put(updateProduct);

module.exports = router;
