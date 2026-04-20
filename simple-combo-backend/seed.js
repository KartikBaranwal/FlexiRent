require('dotenv').config();
const mongoose = require('mongoose');

// Connect MongoDB to the same DB
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/combosDB';

// Reusing same Combo model
const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [String],
  price: Number,
  tag: String
});
const Combo = mongoose.model('Combo', comboSchema);

// Sample Data
const sampleCombos = [
  {
    name: '1BHK Setup',
    price: 2999,
    items: ['Bed', 'Mattress', 'Wardrobe', 'Sofa', 'Fridge', 'Washing Machine'],
    tag: 'Popular Combo'
  },
  {
    name: 'WFH Setup',
    price: 1499,
    items: ['Ergonomic Chair', 'Study Desk', 'Table Lamp'],
    tag: 'Work'
  },
  {
    name: 'Appliance Combo',
    price: 1299,
    items: ['Fridge', 'Washing Machine', 'Microwave'],
    tag: 'Essentials'
  }
];

async function seedData() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected for Seeding');

    // Clear existing combos
    await Combo.deleteMany();
    console.log('Cleared existing combos from database');

    // Insert new sample combos
    await Combo.insertMany(sampleCombos);
    console.log('Successfully seeded combos!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedData();
