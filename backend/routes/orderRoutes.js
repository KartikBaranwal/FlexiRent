const express = require('express');
const router = express.Router();
const {
  addOrderItems, getUserOrders, getMyOrders, swapOrder,
  repairOrder, relocateOrder, cancelRequest,
  cancelRental, deleteRental, adminDeleteRental
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(addOrderItems);
router.route('/user/:userId').get(getUserOrders);
router.route('/my').get(protect, getMyOrders);
router.route('/:id/swap').patch(swapOrder);
router.route('/:id/repair').patch(repairOrder);
router.route('/:id/relocate').patch(relocateOrder);
router.route('/:id/cancel-request').patch(cancelRequest);
router.route('/:id/cancel-rental').patch(cancelRental);
router.route('/:id').delete(deleteRental);
router.route('/admin/:id').delete(protect, adminDeleteRental);

module.exports = router;
