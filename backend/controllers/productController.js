const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public (Admin in production)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.monthlyRent = req.body.monthlyRent || product.monthlyRent;
      product.category = req.body.category || product.category;
      product.imageUrl = req.body.imageUrl || product.imageUrl;
      product.images = req.body.images || product.images;
      product.colors = req.body.colors || product.colors;
      product.rating = req.body.rating !== undefined ? req.body.rating : product.rating;
      product.numReviews = req.body.numReviews !== undefined ? req.body.numReviews : product.numReviews;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, updateProduct };
