const express = require("express");

const { addToCart } = require("../controller/cartController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, addToCart);

module.exports = router;
