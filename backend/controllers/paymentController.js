const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("Backend payment request body:", req.body);

    if (!amount || isNaN(amount) || Number(amount) < 1) {
      console.error("Invalid amount received:", amount);
      return res.status(400).json({ error: "Amount must be a positive number greater than or equal to 1" });
    }

    const orderOptions = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR"
    };

    console.log("Creating Razorpay Order with options:", orderOptions);

    if (!razorpay || !razorpay.orders) {
      throw new Error("Razorpay SDK not initialized correctly");
    }

    const order = await razorpay.orders.create(orderOptions);

    if (!order) {
      throw new Error("Razorpay returned an empty order object");
    }

    console.log("Razorpay Order Created Successfully:", order.id);
    res.json(order);
  } catch (error) {
    console.error("CRITICAL PAYMENT ERROR:", error);
    res.status(500).json({
      error: error.message || "Internal Server Error during order creation",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      const payment = new Payment({
        userId,
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        status: "paid"
      });

      await payment.save();

      res.status(200).json({ message: "Payment verified successfully", payment });
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};