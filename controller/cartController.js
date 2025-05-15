const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { v4: uuidv4 } = require("uuid");

const addToCart = catchAsync(async (req, res, next) => {
  const { productId, productQuantity } = req.body;
  const userId = req.user ? req.user._id : null;
  const sessionId = req.sessionID || uuidv4();

  const numQuantity = parseInt(productQuantity, 10);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    return new AppError(
      "Invalid quantity provided. Quantity must be a positive number",
      400
    );
  }
  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Product not found", 404));
  if (product.quantity < numQuantity)
    return next(
      new AppError(
        `Product quantity is less than ${numQuantity}. Only ${product.quantity} available`,
        400
      )
    );

  let cart;
  if (userId) {
    cart = await Cart.findOne({ userId, active: true });
  } else {
    cart = await Cart.findOne({ sessionId, active: true });
  }

  if (cart) {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].productQuantity + numQuantity;
      if (itemIndex < newQuantity) {
        return next(
          new AppError(`Only ${product.quantity} available in stock `)
        );
      }
      cart.items[itemIndex].productQuantity = newQuantity;
    } else {
      cart.items.push({ productId, productQuantity: numQuantity });
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
      sessionId: userId ? null : sessionId,
      items: [{ productId, productQuantity: numQuantity }],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    if (!userId) {
      req.session.cartId = newCart._id;
    }
    res.status(201).json({
      status: "success",
      message: "Cart created and item added",
      cart: newCart,
    });
  }
});

const updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const userId = req.user ? req.user._id : null;
  const { id: productId } = req.params;
  const sessionId = req.session.id || uuidv4();

  const numQuantity = parseInt(quantity, 10);

  if (isNaN(numQuantity) || numQuantity <= 0)
    return next(
      new AppError(
        "Invalid quantity provided. Quantity must be a positive number",
        400
      )
    );

  const product = await Product.findById({ productId });
  if (!product) return next(new AppError("Product not found", 404));
  if (product.quantity < numQuantity)
    return next(
      new AppError(`Only ${product.quantity} available in stock`, 400)
    );
  let cart;
  if (userId) {
    const cart = Cart.findById({ userId, active: true });
  } else {
    const cart = Cart.findById({ userId, active: true });
  }
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

module.exports = {
  addToCart,
  viewCart,
  removeFromCart,
  updateCartItemQuantity,
};
