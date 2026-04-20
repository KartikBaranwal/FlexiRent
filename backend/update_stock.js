const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const Product = require('./models/Product');

dotenv.config();
dns.setServers(['8.8.8.8']);

const updateStock = async (productName, newStock) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const product = await Product.findOneAndUpdate(
            { name: new RegExp(productName, 'i') },
            { stock: Number(newStock) },
            { new: true }
        );
        if (product) {
            console.log(`✅ Success: ${product.name} stock updated to ${product.stock}`);
        } else {
            console.log(`❌ Error: Product matching "${productName}" not found.`);
        }
        process.exit();
    } catch (e) {
        console.error("❌ Failed to update stock:", e.message);
        process.exit(1);
    }
};

const [,, name, stock] = process.argv;
if (!name || !stock) {
    console.log("Usage: node update_stock.js \"Product Name\" <stock_number>");
    process.exit(1);
}

updateStock(name, stock);
