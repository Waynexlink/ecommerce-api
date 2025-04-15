const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const createOrderFromCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price",
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot create order for empty cart",
      });
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
  } catch (error) {
    console.log(`Error creating order from cart: ${error} `);
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error creating order",
    });
  }
};
const viewMyOrders = async (req, res) => {
  const userId = req.user._id;
  try {
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
  } catch (error) {
    console.log(`Error fetching orders: ${error} `);
    res.status(500).json({
      status: "error",
      message: "Internal server error creating order",
    });
  }
};

const viewOrder = async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({ _id: orderId, userId }).populate({
      path: "items.productId",
      select: "name price",
    });
    if (!order)
      return res.status(404).message({
        status: "fail",
        message: "This order does not exist or forbidden",
      });
    res.status(200).json({
      status: "success",
      message: "order retrived successfully",
      order,
    });
  } catch (error) {
    console.log(`Error fetching order: ${error} `);
    res.status(500).json({
      status: "error",
      message: "Internal server error creating order",
    });
  }
};
//admin operations
const viewAllOrders = (req, res) => {
  try {
    //restricted to just admin
    const order = Order.find();
    if (!order.length)
      return res.status(404).json({
        status: "fail",
        message: "No order found",
        order: [],
      });

    res.status(200).json({
      status: "success",
      message: "Orders retrived successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error retriving orders",
    });
  }
};
const updateOrder = (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  try {
    const validStatus = ["processing", "shipped", "delivered"];
    if (!validStatus.includes(orderStatus)) {
      return res.status(400).json({
        status: "fail",
        message: "Status not valid",
      });
    }
    const updatedOrder = Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true, runValidators: true }
    );
    if (!updatedOrder)
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });

    res.status(200).json({
      status: "success",
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error updating orders",
    });
  }
};

module.exports = {
  createOrderFromCart,
  viewMyOrders,
  viewOrder,
  viewAllOrders,
  updateOrder,
};
