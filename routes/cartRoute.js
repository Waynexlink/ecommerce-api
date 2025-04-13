const express = require("express");

const {
  addToCart,
  viewCart,
  removeFromCart,
  updateCartItemQuantity,
} = require("../controller/cartController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, addToCart);
router.get("/", requireAuth, viewCart);
router.delete("/product/:id", requireAuth, removeFromCart);
router.put("/product/:id", requireAuth, updateCartItemQuantity);

module.exports = router;
