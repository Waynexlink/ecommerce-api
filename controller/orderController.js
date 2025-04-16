const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const createOrderFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name price",
  });
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Cannot create order for empty cart", 400));
  }
  let totalPrice = 0;
  let orderItem = cart.items.map((item) => {
    if (item.productId || typeof item.productId.price === undefined) {
      throw new Error(
        `product details missing for items id:${item.productId?._id}`
      );
    }
    const itemPrice = item.productId.price;
    const itemQuantity = item.productQuantity;
    totalPrice += itemPrice * itemQuantity;
    return {
      productId: item.productId._id,
      productQuantity: itemQuantity,
      priceAtOrder: itemPrice,
    };
  });

  const newOrder = await Order.create({
    userId,
    orderItem,
    totalPrice,
  });

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    newOrder,
  });

  await Cart.deleteOne({ userId });
});
const viewMyOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const orders = await Order.find({ userId }).populate({
    path: "items.productId",
    select: "name price",
  });

  if (!orders) {
    return res.status(200).json({
      status: "success",
      message: "No orders yet",
      orders: [],
    });
  }
  res.status(200).json({
    status: "success",
    message: "orders fetched successfully",
    orders,
  });
});

const viewOrder = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { orderId } = req.params;
  const order = await Order.findOne({ _id: orderId, userId }).populate({
    path: "items.productId",
    select: "name price",
  });
  if (!order)
    return next(
      new AppError("This order does not exist or cannot be accessed", 404)
    );
  res.status(200).json({
    status: "success",
    message: "order retrived successfully",
    order,
  });
});
//admin operations
const viewAllOrders = catchAsync(async (req, res) => {
  //restricted to just admin
  const order = Order.find();
  if (!order.length) return next(new AppError("No order found", 404));

  res.status(200).json({
    status: "success",
    message: "Orders retrived successfully",
    order,
  });
});
const updateOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;
  const validStatus = ["processing", "shipped", "delivered"];
  if (!validStatus.includes(orderStatus)) {
    return next(new AppError("Status not valid", 400));
  }
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus },
    { new: true, runValidators: true }
  );
  if (!updatedOrder) return next(new AppError("Order not found", 404));

  res.status(200).json({
    status: "success",
    message: "Order status updated",
    order: updatedOrder,
  });
});

module.exports = {
  createOrderFromCart,
  viewMyOrders,
  viewOrder,
  viewAllOrders,
  updateOrder,
};
