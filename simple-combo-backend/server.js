require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB (defaults to local combosDB)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/combosDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Combo model
const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [String],
  price: Number,
  tag: String
});
const Combo = mongoose.model('Combo', comboSchema);

// GET /combos API
app.get('/combos', async (req, res) => {
  try {
    const combos = await Combo.find();
    res.json(combos);
  } catch (error) {
    res.status(500).json({ error: 'Server Error occurred' });
  }
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Simple API running on http://localhost:${PORT}`);
});
