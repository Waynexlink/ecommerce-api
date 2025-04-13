const Product = require("../models/productModel");

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});

    res.status(200).json({
      status: success,
      products,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOnebyId(productId);

    if (!product)
      return res.status(404).json({
        status: "fail",
        message: `No product with id: ${productid} `,
      });

    res.status(200).json({
      status: success,
      product,
    });
  } catch (error) {
    console.error(
      `Error in getProductById for ID ${req.params.productId}:`,
      error
    );
    // Basic check for CastError (invalid ID format) - more robust error handling could be added
    if (error.name === "CastError") {
      return res.status(400).json({
        // 400 Bad Request for invalid ID format
        status: "fail",
        message: `Invalid Product ID format: ${req.params.productId}`,
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = { getAllProducts, getProductById };
