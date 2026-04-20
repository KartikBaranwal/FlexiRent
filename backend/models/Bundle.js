const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      }
    ],
    monthlyRent: {
      type: Number,
      required: true,
    },
    originalRent: {
      type: Number,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Combos'
    },
    rating: {
      type: Number,
      default: 5.0
    }
  },
  {
    timestamps: true,
  }
);

const Bundle = mongoose.model('Bundle', bundleSchema);
module.exports = Bundle;
