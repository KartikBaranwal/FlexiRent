const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Bundle = require('./models/Bundle');
const User = require('./models/User');
const Order = require('./models/Order');

// Load environment variables
dotenv.config();

const productsData = [
  { name: "Classic Wooden Bed", description: "Premium teak wood bed with a classic headboard design.", monthlyRent: 850, category: "Furniture", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80", rating: 4.8, stock: 0 },
  { name: "Ergonomic Mesh Chair", description: "Adjustable task chair with lumbar support.", monthlyRent: 300, category: "Furniture", imageUrl: "https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXJnb25vbWljJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D", rating: 4.5, stock: 3 },
  { name: "Double Door Refrigerator", description: "Energy efficient double door fridge perfect for small families.", monthlyRent: 950, category: "Appliances", imageUrl: "https://images.unsplash.com/photo-1722603929403-de9e80c46a9a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", rating: 4.7, stock: 5 },
  { name: "1.5 Ton Split AC", description: "Fast cooling, energy efficient air conditioner.", monthlyRent: 1200, category: "Appliances", imageUrl: "https://plus.unsplash.com/premium_photo-1679943423706-570c6462f9a4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWlyJTIwY29uZGl0aW9uZXJ8ZW58MHx8MHx8fDA%3D", rating: 4.9, stock: 1 },
  { name: "Motorized Treadmill", description: "Foldable treadmill with incline settings.", monthlyRent: 1500, category: "Fitness", imageUrl: "https://images.unsplash.com/photo-1652364653960-1c23c208ef43?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dHJlZG1pbGx8ZW58MHx8MHx8fDA%3D", rating: 4.6, stock: 2 },
  { name: "Mountain Cycle 21-Speed", description: "Durable all-terrain bicycle.", monthlyRent: 600, category: "Fitness", imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", rating: 4.5, stock: 0 },
  { name: "Convection Microwave Oven", description: "Bake, grill, and heat with ease.", monthlyRent: 400, category: "Appliances", imageUrl: "https://media.istockphoto.com/id/1194635650/photo/opening-door-on-built-in-oven.webp?a=1&b=1&s=612x612&w=0&k=20&c=qFn0q6ua11UuMRMuE0Qydp0LnWUexisLfnZPuAcFSkE=", rating: 4.6, stock: 4 },
  { name: "Orthopedic Memory Foam Mattress", description: "Sleep better with high density memory foam.", monthlyRent: 500, category: "Furniture", imageUrl: "https://images.unsplash.com/photo-1759176171634-674f37841636?q=80&w=979&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", rating: 4.9, stock: 8 },
  { name: "Induction Cooktop", description: "Fast heating portable induction stove.", monthlyRent: 200, category: "Appliances", imageUrl: "https://media.istockphoto.com/id/1178085244/photo/kitchenware-pan-at-small-electric-stove-with-timer-on-control-panel-modern-kitchen-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=_hjikxixEL1I7VF-8ktO2L7Q8zvi2_Ma99HUkyg9UNg=", rating: 4.4, stock: 2 },
  { name: "Wooden Wardrobe 3-Door", description: "Spacious wardrobe with mirror.", monthlyRent: 800, category: "Furniture", imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80", rating: 4.7, stock: 0 },
  { name: "Desert Air Cooler", description: "High capacity cooling for summers.", monthlyRent: 450, category: "Appliances", imageUrl: "/desert_air_cooler.png", rating: 4.3, stock: 10 },
  { name: "L-Shaped Sectional Sofa", description: "Premium fabric sectional sofa layout.", monthlyRent: 1100, category: "Furniture", imageUrl: "https://images.unsplash.com/photo-1705028877445-88d4d7fa5569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bCUyMHNoYXBlZCUyMHNvZmF8ZW58MHx8MHx8fDA%3D", rating: 4.8, stock: 1 },
  { name: "Smart Bluetooth Speaker", description: "High-fidelity sound with deep bass and voice assistant support.", monthlyRent: 250, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1595432541891-a461100d3054?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BlYWtlcnN8ZW58MHx8MHx8fDA%3D", rating: 4.8, stock: 6 },
  { name: "Multifunction Laser Printer", description: "Fast, wireless printing and scanning for your home office.", monthlyRent: 450, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJpbnRlcnN8ZW58MHx8MHx8fDA%3D", rating: 4.6, stock: 3 },
  { name: "Next-Gen Gaming Console", description: "4K gaming with lightning-fast load times and immersive graphics.", monthlyRent: 1100, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FtaW5nJTIwY29uc29sZXN8ZW58MHx8MHx8fDA%3D", rating: 4.9, stock: 0 },
  { name: "Fully Automatic Washing Machine", description: "Gentle on clothes, tough on stains. 7kg capacity with smart wash cycles.", monthlyRent: 800, category: "Appliances", imageUrl: "https://media.istockphoto.com/id/1137138120/photo/photo-of-white-washing-machine-with-soft-and-fresh-bright-towels-on-top-standing-isolated.webp?a=1&b=1&s=612x612&w=0&k=20&c=NM7NdrjN62USl38qOJdCi8GQauFYjSYE6Xy2V4L7HtU=", rating: 4.7, stock: 2 },
  { name: "4K Smart LED TV", description: "Immersive 4K resolution with smart features and cinematic sound.", monthlyRent: 900, category: "Appliances", imageUrl: "https://plus.unsplash.com/premium_photo-1683133215610-854ad000bba1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dGVsZXZpc2lvbnxlbnwwfHwwfHx8MA%3D%3D", rating: 4.8, stock: 5 },
  { name: "Executive Office Desk", description: "Spacious heavy-duty desk for your home office.", monthlyRent: 400, category: "Furniture", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800", rating: 4.5, stock: 4 }
];

const connectDB = async () => {
  try {
    require('dns').setServers(['8.8.8.8']);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Product.deleteMany();
    await Bundle.deleteMany();
    await Order.deleteMany();
    await User.deleteMany();

    console.log('Inserting 12 rich products into catalog...');
    const createdProducts = await Product.insertMany(productsData);

    const bundlesData = [
      {
        name: "1BHK Setup Combo",
        imageUrl: "https://images.unsplash.com/photo-1753505889211-9cfbac527474?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fDFCSEslMjBzZXR1cHxlbnwwfHwwfHx8MA%3D%3D",
        category: "Combos",
        monthlyRent: 4000,
        items: [
          createdProducts[0]._id, // Bed
          createdProducts[7]._id, // Mattress
          createdProducts[9]._id, // Wardrobe
          createdProducts[11]._id, // Sofa
          createdProducts[2]._id, // Fridge
          createdProducts[15]._id  // Washing Machine
        ]
      },
      {
        name: "Professional WFH Setup",
        imageUrl: "https://images.unsplash.com/photo-1652352530301-dc807f7113a4?w=600&auto=format&fit=crop&q=60",
        category: "Combos",
        monthlyRent: 1200,
        items: [
          createdProducts[1]._id, // Mesh Chair
          createdProducts[17]._id, // Desk
          createdProducts[13]._id // Laser Printer
        ]
      },
      {
        name: "Essential Appliances Combo",
        imageUrl: "https://plus.unsplash.com/premium_photo-1679943423706-570c6462f9a4?w=600&auto=format&fit=crop&q=60",
        category: "Combos",
        monthlyRent: 2500,
        items: [
          createdProducts[2]._id, // Fridge
          createdProducts[15]._id, // Washing Machine
          createdProducts[3]._id, // AC
          createdProducts[6]._id  // Microwave
        ]
      }
    ];

    await Bundle.insertMany(bundlesData);
    console.log('Combos inserted successfully.');

    console.log('✅ ALL DATA IMPORTED SUCCESSFULLY!');
    process.exit();
  } catch (error) {
    console.error(`❌ Data Import Failed: ${error.message}`);
    process.exit(1);
  }
};

importData();
