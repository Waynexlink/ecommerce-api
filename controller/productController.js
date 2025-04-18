const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { findByIdAndDelete } = require("../models/userModel");

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    status: success,
    products,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findOnebyId(productId);

  if (!product)
    return next(new AppError(`No product with id: ${productid} `, 404));

  res.status(200).json({
    status: success,
    product,
  });
});
const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, quantity, image, category } = req.body;
  //am not sure image should be there its probably gonna be handled with cloudinary
  const product = await Product.create({
    name,
    description,
    price,
    quantity,
    image,
    category,
  });
  res.status(201).json({
    status: success,
    product,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const allowedUpdates = [
    "name",
    "description",
    "price",
    "quantity",
    "image",
    "category",
  ];

  const updateData = {};

  allowedUpdates.forEach((update) => {
    if (req.body[update] !== undefined) {
      updateData[update] = req.body[update];
    }
  });

  const product = Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    message: "Product successfully updated",
    product,
  });
});
const deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findByIdAndDelete(productId);
  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
  });
});
const viewProductInventory = catchAsync(async (req, res, next) => {
  const products = await Product.find().select("name quantity");

  if (!products || products.length == 0)
    return next(new AppError("No product found in this Inventory", 404));

  res.status(200).json({
    status: "success",
    data: {
      products,
    },
  });
});
const updateQuantity = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const product = await Product.findByIdAndUpdate(
    productId,
    { quantity },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    message: "Quantity updated successfully",
  });
});
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  viewProductInventory,
  updateQuantity,
};
