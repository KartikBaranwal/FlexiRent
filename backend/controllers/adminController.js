const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');

// ─── USERS ───────────────────────────────────────────────────────────────────

// @desc  Get all users
// @route GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @desc  Delete user + their wishlist (keep orders)
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await Wishlist.deleteOne({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

// @desc  Get all products
// @route GET /api/admin/products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// @desc  Add a product
// @route POST /api/admin/products
const addProduct = async (req, res, next) => {
  try {
    const { name, description, monthlyRent, category, imageUrl, images, colors, stock } = req.body;
    const product = await Product.create({
      name,
      description,
      monthlyRent,
      category,
      imageUrl,
      images: images || [],
      colors: colors || [],
      stock: stock ?? 10,
      rating: 0,
      numReviews: 0,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// @desc  Update a product
// @route PUT /api/admin/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const fields = ['name', 'description', 'monthlyRent', 'category', 'imageUrl', 'images', 'colors', 'stock'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });
    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a product
// @route DELETE /api/admin/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── RENTALS (Orders) ─────────────────────────────────────────────────────────

// @desc  Get all rentals with user info
// @route GET /api/admin/rentals
const getAllRentals = async (req, res, next) => {
  try {
    const rentals = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    next(err);
  }
};

// @desc  Update rental status
// @route PATCH /api/admin/rentals/:id/status
const updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'active', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Rental not found');
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @desc  Get dashboard stats
// @route GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, activeRentals, totalRentals] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({ status: 'active' }),
      Order.countDocuments({}),
    ]);
    res.json({ totalUsers, totalProducts, activeRentals, totalRentals });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllRentals,
  updateRentalStatus,
  getStats,
};
