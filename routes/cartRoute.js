const express = require("express");

const {
  addToCart,
  viewCart,
  removeFromCart,
  updateCartItemQuantity,
  calculateCartTotal,
  mergeGuestCart,
} = require("../controller/cartController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", addToCart);
router.get("/", viewCart);
router.delete("/product/:id", removeFromCart);
router.put("/product/:id", updateCartItemQuantity);
router.get("/product/:id", calculateCartTotal);
router.post("/product/:id", requireAuth, mergeGuestCart);
module.exports = router;
