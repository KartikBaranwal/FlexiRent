const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const Product = require('./models/Product');

dotenv.config();
dns.setServers(['8.8.8.8']);

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}, '_id name stock');
        console.log("Current Products in DB:");
        console.log(JSON.stringify(products, null, 2));
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
