const express = require("express");
const orderController = require("../controller/orderController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  createOrderFromCart,
  viewMyOrders,
  viewOrder,
  viewAllOrders,
  updateOrder,
} = require("../controller/orderController");

const router = express.Router();

//user
router.post("/", requireAuth, createOrderFromCart);
router.get("/", requireAuth, viewMyOrders);
router.get("/:orderId", requireAuth, viewOrder);

//admin
router.get("/admin/all", requireAuth, requireAdmin, viewAllOrders);
router.put("/admin/status/:orderId", requireAuth, requireAdmin, updateOrder);
module.exports = router;
