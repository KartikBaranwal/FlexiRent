const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/isAdmin');
const {
  getAllUsers,
  deleteUser,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllRentals,
  updateRentalStatus,
  getStats,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, isAdmin);

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Products
router.get('/products', getAllProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Rentals
router.get('/rentals', getAllRentals);
router.patch('/rentals/:id/status', updateRentalStatus);

module.exports = router;
