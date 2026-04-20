const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: {
      type: Array,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalMonthlyRent: {
      type: Number,
      default: 0,
    },
    rentalDurationMonths: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
    repairStatus: { type: String, default: null },
    repairNote: { type: String, default: null },
    swapStatus: { type: String, default: null },
    swapTargetName: { type: String, default: null },
    swapTargetImage: { type: String, default: null },
    relocateStatus: { type: String, default: null },
    relocateAddress: { type: String, default: null },
    relocateDate: { type: String, default: null },
    originalSwapItems: { type: Array, default: null },
    originalMonthlyRent: { type: Number, default: null },
    swapUsed: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
