const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

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
module.exports = { getAllProducts, getProductById, createProduct };
