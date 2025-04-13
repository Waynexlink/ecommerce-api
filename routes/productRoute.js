const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
} = require("../controller/productController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.post("/", requireAuth, requireAdmin, createProduct);

module.exports = router;
