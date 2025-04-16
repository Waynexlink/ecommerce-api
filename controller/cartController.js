const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const addToCart = catchAsync(async (req, res, next) => {
  const { productId, productQuantity } = req.body;
  const userId = req.user._id;

  const numQuantity = parseInt(productQuantity, 10);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    res.status(400).json({
      status: fail,
      message: "Invalid quantity provided",
    });
  }
  const productExist = await Product.findById(productId);
  if (!productExist) return next(new AppError("Product not found", 404));

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
});

const viewCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name price image",
    model: "Product",
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
});

const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const cart = Cart.findOne({ userId });
  if (!cart) return next(new AppError("Cart not found for this user", 404));

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
    //success message
    res.status(201).json({
      status: "success",
      message: "Item removed from cart",
    });
  } else {
    return next(new AppError("Item not found", 404));
  }
});

const updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const newProductQuantity = req.body.quantity;
  const userId = req.user._id;
  const { productId } = req.params;

  const numQuantity = parseInt(newProductQuantity, 10);

  if (isNaN(numQuantity) || numQuantity <= 0)
    return next(
      new AppError(
        "Invalid quantity provided. Quantity must be a positive number",
        400
      )
    );

  const cart = await Cart.findOne({ userId });
  if (!cart) return next(new AppError("Cart not found.", 404));

  const itemIndex = cart.items.findIndex((item) => {
    item.productId.toString() === productId;
  });

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = numQuantity;
    await cart.save();
    res.status(200).json({
      status: "success",
      message: "Cart item quantity updated ",
      cart,
    });
  } else {
    return next(new AppError("item not found in cart", 404));
  }
});
module.exports = {
  addToCart,
  viewCart,
  removeFromCart,
  updateCartItemQuantity,
};
