const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// Helper: generate transactions for an order.
// itemName is stamped on each transaction so the UI never needs to look it up from orders.
const generateTransactions = async (order, itemName = '') => {
  if (!order.userId) return; // skip guest orders

  const { _id: orderId, userId, totalMonthlyRent, rentalDurationMonths, createdAt } = order;
  const rent = totalMonthlyRent || 0;
  const months = rentalDurationMonths || 1;
  const orderDate = new Date(createdAt);
  const txns = [];

  // 1. Security Deposit → paid immediately (2× monthly rent)
  txns.push({
    userId, orderId, type: 'deposit',
    amount: rent * 2, status: 'paid',
    dueDate: orderDate, paidAt: orderDate, itemName,
  });

  // 2. Month 1 rent → paid immediately (advance)
  txns.push({
    userId, orderId, type: 'rent',
    amount: rent, status: 'paid',
    dueDate: orderDate, paidAt: orderDate, itemName,
  });

  // 3. Remaining months → pending, due on the 1st of each subsequent month
  for (let m = 2; m <= months; m++) {
    const dueDate = new Date(orderDate);
    dueDate.setMonth(dueDate.getMonth() + (m - 1));
    dueDate.setDate(1);
    txns.push({
      userId, orderId, type: 'rent',
      amount: rent, status: 'pending',
      dueDate, paidAt: null, itemName,
    });
  }

  await Transaction.insertMany(txns);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const addOrderItems = async (req, res, next) => {
  try {
    const { items, totalAmount, userId, totalMonthlyRent, rentalDurationMonths } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = new Order({
      userId: userId || null,
      items,
      totalAmount,
      totalMonthlyRent: totalMonthlyRent || 0,
      rentalDurationMonths: rentalDurationMonths || 1,
      status: 'active',
    });

    // Reduce stock for products in the order
    for (const item of items) {
      if (item._id && !item._id.toString().startsWith('bundle-')) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: -(item.quantity || 1) }
        });
      }
    }

    const createdOrder = await order.save();
    const firstItemName = items[0]?.name || '';

    // Auto-generate transactions (non-blocking)
    generateTransactions(createdOrder, firstItemName).catch((err) =>
      console.error('Transaction generation failed:', err)
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Swap item in an order — updates order, deletes stale pending txns, regenerates future ones
// @route   PATCH /api/orders/:id/swap
// @access  Public
const swapOrder = async (req, res, next) => {
  try {
    const { newItem, newMonthlyRent } = req.body;
    // newItem: { name, imageUrl, ...any other item fields }
    // newMonthlyRent: number

    if (!newItem || !newItem.name) {
      res.status(400);
      throw new Error('newItem with at least a name is required');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Enforce one-swap-per-product rule
    if (order.swapUsed) {
      res.status(400);
      throw new Error('This product has already been swapped once. Further swaps are not allowed.');
    }

    const rent = newMonthlyRent ?? order.totalMonthlyRent;

    if (!order.originalSwapItems || order.originalSwapItems.length === 0) {
      order.originalSwapItems = JSON.parse(JSON.stringify(order.items));
      order.originalMonthlyRent = order.totalMonthlyRent;
    }

    // 1. Patch the order
    order.items = [newItem];
    order.totalMonthlyRent = rent;
    order.totalAmount = rent * (order.rentalDurationMonths || 1);
    order.swapStatus = 'Processing';
    order.swapTargetName = newItem.name;
    order.swapTargetImage = newItem.imageUrl;
    order.swapUsed = true;
    const updatedOrder = await order.save();

    // 2. Delete ALL pending transactions for this order (paid ones stay in history)
    await Transaction.deleteMany({ orderId: order._id, status: 'pending' });

    // 3. Regenerate pending transactions for remaining months
    //    Count how many months have already been paid to determine remaining months
    const paidRentCount = await Transaction.countDocuments({
      orderId: order._id,
      type: 'rent',
      status: 'paid',
    });
    const totalMonths = order.rentalDurationMonths || 1;
    const remainingMonths = Math.max(totalMonths - paidRentCount, 0);

    const newTxns = [];
    const now = new Date();
    for (let m = 1; m <= remainingMonths; m++) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + m);
      dueDate.setDate(1);
      newTxns.push({
        userId: order.userId,
        orderId: order._id,
        type: 'rent',
        amount: rent,
        status: 'pending',
        dueDate,
        paidAt: null,
        itemName: newItem.name,
      });
    }

    let newTransactions = [];
    if (newTxns.length > 0 && order.userId) {
      newTransactions = await Transaction.insertMany(newTxns);
    }

    res.json({ order: updatedOrder, newTransactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for a specific user
// @route   GET /api/orders/user/:userId
// @access  Public
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders (legacy, auth-protected)
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a repair request for an order
// @route   PATCH /api/orders/:id/repair
// @access  Public
const repairOrder = async (req, res, next) => {
  try {
    const { repairNote } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    
    order.repairStatus = 'Pending Inspection';
    order.repairNote = repairNote;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a relocation request for an order
// @route   PATCH /api/orders/:id/relocate
// @access  Public
const relocateOrder = async (req, res, next) => {
  try {
    const { relocateAddress, relocateDate } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    
    order.relocateStatus = 'Processing';
    order.relocateAddress = relocateAddress;
    order.relocateDate = relocateDate;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a repair, swap, or relocate request
// @route   PATCH /api/orders/:id/cancel-request
// @access  Public
const cancelRequest = async (req, res, next) => {
  try {
    const { type } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (type === 'repair') {
      order.repairStatus = null;
      order.repairNote = null;
    } else if (type === 'swap') {
      order.swapStatus = null;
      order.swapTargetName = null;
      order.swapTargetImage = null;

      if (order.originalSwapItems && order.originalSwapItems.length > 0) {
        order.items = order.originalSwapItems;
        order.markModified('items');
        order.totalMonthlyRent = order.originalMonthlyRent;
        order.totalAmount = order.originalMonthlyRent * (order.rentalDurationMonths || 1);
        
        // Restore pending transactions
        await Transaction.deleteMany({ orderId: order._id, status: 'pending' });
        
        const paidRentCount = await Transaction.countDocuments({
          orderId: order._id,
          type: 'rent',
          status: 'paid',
        });
        const totalMonths = order.rentalDurationMonths || 1;
        const remainingMonths = Math.max(totalMonths - paidRentCount, 0);

        const newTxns = [];
        const now = new Date();
        for (let m = 1; m <= remainingMonths; m++) {
          const dueDate = new Date(now);
          dueDate.setMonth(dueDate.getMonth() + m);
          dueDate.setDate(1);
          newTxns.push({
            userId: order.userId,
            orderId: order._id,
            type: 'rent',
            amount: order.originalMonthlyRent,
            status: 'pending',
            dueDate,
            paidAt: null,
            itemName: order.originalSwapItems[0].name,
          });
        }
        
        let newTransactions = [];
        if (newTxns.length > 0 && order.userId) {
          newTransactions = await Transaction.insertMany(newTxns);
        }
        
        order.originalSwapItems = null;
        order.originalMonthlyRent = null;
        
        const updatedOrder = await order.save();
        return res.json({ order: updatedOrder, newTransactions });
      }
    } else if (type === 'relocate') {
      order.relocateStatus = null;
      order.relocateAddress = null;
      order.relocateDate = null;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a rental (soft — sets status to cancelled, keeps record)
// @route   PATCH /api/orders/:id/cancel-rental
// @access  Public (userId validated in body)
const cancelRental = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Rental not found');
    }

    // Ownership check
    if (!order.userId || order.userId.toString() !== userId) {
      res.status(403);
      throw new Error('You are not authorized to cancel this rental');
    }

    if (order.status === 'cancelled') {
      res.status(400);
      throw new Error('Rental is already cancelled');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();

    // Also cancel all pending transactions
    await Transaction.updateMany(
      { orderId: order._id, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    // Restore stock for items
    for (const item of order.items) {
      if (item._id && !item._id.toString().startsWith('bundle-')) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: item.quantity || 1 }
        });
      }
    }

    // Create cancellation fee transaction (1 month rent)
    const now = new Date();
    const itemName = order.items[0]?.name || 'Rental Item';
    const cancellationTxn = await Transaction.create({
      userId: order.userId,
      orderId: order._id,
      type: 'cancellation',
      amount: order.totalMonthlyRent || 0,
      status: 'paid',
      dueDate: now,
      paidAt: now,
      itemName,
    });

    const updatedOrder = await order.save();
    res.json({ order: updatedOrder, cancellationTransaction: cancellationTxn });
  } catch (error) {
    next(error);
  }
};

// @desc    Hard-delete a rental (user can only delete their own)
// @route   DELETE /api/orders/:id
// @access  Public (userId validated in body)
const deleteRental = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Rental not found');
    }

    // Ownership check
    if (!order.userId || order.userId.toString() !== userId) {
      res.status(403);
      throw new Error('You are not authorized to delete this rental');
    }

    // Restore stock for items
    for (const item of order.items) {
      if (item._id && !item._id.toString().startsWith('bundle-')) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: item.quantity || 1 }
        });
      }
    }

    // Delete associated transactions
    await Transaction.deleteMany({ orderId: order._id });

    await Order.findByIdAndDelete(order._id);
    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin hard-delete any rental
// @route   DELETE /api/orders/admin/:id
// @access  Private/Admin
const adminDeleteRental = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Rental not found');
    }

    for (const item of order.items) {
      if (item._id && !item._id.toString().startsWith('bundle-')) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: item.quantity || 1 }
        });
      }
    }

    await Transaction.deleteMany({ orderId: order._id });
    await Order.findByIdAndDelete(order._id);
    res.json({ message: 'Rental deleted by admin successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrderItems, getUserOrders, getMyOrders, swapOrder,
  repairOrder, relocateOrder, cancelRequest,
  cancelRental, deleteRental, adminDeleteRental
};
