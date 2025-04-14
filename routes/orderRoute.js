const express = require("express");
const orderController = require("../controller/orderController");
const { requireAuth } = require("../middleware/authMiddleware");
const { createOrderFromCart } = require("../controller/orderController");

const router = express.Router();

router.post("/", requireAuth, createOrderFromCart);

module.exports = router;
