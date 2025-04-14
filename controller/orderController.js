const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const createOrderFromCart = (req, res, next) => {
  const { userId } = req.user;

  try {
    const userCart = Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price",
      model: "Product",
    });
    if (!userCart)
      return res.status(201).json({
        status: "success",
        message: "Cart is empty",
        cart: null,
      });
    const totalPrice = userCart.items.reduce((acc, curVal) => {
      acc.price * acc.productQuantity + curVal, 0;
    });

    const userOrder = Order.create({
      userId,
    });
  } catch (error) {}
};

module.exports = { createOrderFromCart };
