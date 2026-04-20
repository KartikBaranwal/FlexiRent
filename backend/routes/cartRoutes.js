const express = require("express");
const router = express.Router();
const { addToCart, getCart, removeFromCart, clearCart } = require("../controllers/cartController");

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.post("/remove", removeFromCart); // Using POST /remove as per common practice if body is needed, or I can use DELETE
router.delete("/clear/:userId", clearCart);

module.exports = router;
