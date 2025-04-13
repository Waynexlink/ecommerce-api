const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const addToCart = async (req, res, next) => {
  const { productId, productQuantity } = req.body;
  const userId = req.user._id;

  const numQuantity = parseInt(productQuantity, 10);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    res.status(400).json({
      status: fail,
      message: "Invalid quantity provided",
    });
  }
  try {
    const productExist = await Product.findById(productId);
    if (!productExist) {
      res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].productQuantity += numQuantity;
      } else {
        cart.items.push({ productId, productQuantity });
      }
      await cart.save();
      res.status(200).json({
        status: "success",
        message: "Cart Updated",
        cart,
      });
    } else {
      const newCart = await Cart.create({
        userId,
        items: [{ productId, productQuantity }],
      });
      res.status(201).json({
        status: "success",
        message: "Cart created and item added",
        cart,
      });
    }
  } catch (error) {
    console.log("Cart not added", error.stack, error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const viewCart = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId }).populate({path: items.productId,
      ref:

    });
    if (!cart)
      return res.status(201).json({
        status: "success",
        message: "Cart is empty",
        cart: null,
      });
    res.status(200).json({
      status: "success",
      cart,
    });
  } catch (error) {
    console.log("Cart not added", error.stack, error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
module.exports = { addToCart, viewCart };
