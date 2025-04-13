const express = require("express");
const {
  getAllProducts,
  getProductById,
} = require("../controller/productController");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getProductById);

module.exports = router;
