const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/orderModel");

const createOrderFromCart = async (req, res, next) => {
  const userId = req.user.Id;

  try {
    const cart = Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price",
    });
    if (!cart || cart.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot create order for empty cart",
      });
    }
    let totalPrice = 0;
    let orderItem = cart.items.map((item) => {
      if (item.productId || typeof item.productId === undefined) {
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

    const newOrder = Order.create({
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
      message: error.message,"Internal server error creating order";
    });
  }
};
const viewMyOrders = (req, res, next) => {
  try {
    //add pagination and filtering with apifeatures class so i can use in multiple places
    const orders = Order.find();

    if (!orders || orders === null) {
      return res.status(200).json({
        status: "success",
        message: "No orders yet",
      });
    }
    res.status(200).json({
      status: "success",
      message: "orders fetched successfully",
      orders,
    });
  } catch (error) {}
};

const viewOrder = (req, res, next) => {
  const { userId } = req.params;
  try {
    const order = Order.findOne({ userId });
    if (!order)
      return res.status(404).message({
        status: "fail",
        message: "This order does not exist",
      });
    res.status(200).json({
      status: "success",
      message: "order retrived successfully",
      order,
    });
  } catch (error) {}
};

const viewAllOrders = (req, res) => {};
const updateOrder = (req, res) => {
  const { productId } = req.params;
  const { orderStatus } = req.body;

  try {
  } catch (error) {}
};

module.exports = {
  createOrderFromCart,
  viewMyOrders,
  viewOrder,
  viewAllOrders,
  updateOrder,
};
