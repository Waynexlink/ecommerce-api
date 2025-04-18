const express = require("express");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  viewProductInventory,
  updateQuantity,
} = require("../controller/productController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:productId", getProductById);
//admin functionality

router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.array("images", 5),
  createProduct
);
router.put("/:productId", requireAuth, requireAdmin, updateProduct);
router.delete("/:productId", requireAuth, requireAdmin, deleteProduct);
router.get(
  "/:productId/inventory",
  requireAuth,
  requireAdmin,
  viewProductInventory
);
router.put(
  "/:productId/inventory",
  requireAuth,
  requireAdmin,
  upload.array("images", 5),
  updateQuantity
);

module.exports = router;
