const Bundle = require('../models/Bundle');

// @desc    Fetch all bundles
// @route   GET /api/bundles
// @access  Public
const getBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find({}).populate('items');
    res.json(bundles);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single bundle
// @route   GET /api/bundles/:id
// @access  Public
const getBundleById = async (req, res, next) => {
  try {
    const bundle = await Bundle.findById(req.params.id).populate('items');
    if (bundle) {
      res.json(bundle);
    } else {
      res.status(404);
      throw new Error('Bundle not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getBundles, getBundleById };
