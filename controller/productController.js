const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const fs = require("fs").promises;
const cloudinary = require("../config/cloudinary");
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
  const { name, description, price, quantity, category } = req.body;

  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecommerce_product",
          resource_type: "image",
        });
        imageUrls.push(result.secure_url);
        await fs.unlink(file.path);
      } catch (error) {
        for (file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
        return next(new AppError("Error uploading images to Cloudinary", 500));
      }
    }
  } else if (req.body.image && Array.isArray(req.body.image)) {
    imageUrls = req.body.image;
  }
  //am not sure image should be there its probably gonna be handled with cloudinary
  if (!name || !description || !price || !quantity) {
    return next(new AppError("Missing required product fields", 400));
  }
  const product = await Product.create({
    name,
    description,
    price,
    quantity,
    image: imageUrls,
    category,
  });
  res.status(201).json({
    status: "success",
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
  let imageUrls = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecommerce_product",
          resource_type: "image",
        });
        imageUrls.push(result.secure_url);
        await fs.unlink(file.path);
      } catch (error) {
        for (const file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
        return next(new AppError("Error uploading images to Cloudinary", 500));
      }
    }
    updateData.image = imageUrls;
  }

  allowedUpdates.forEach((update) => {
    if (req.body[update] !== undefined && update !== "image") {
      updateData[update] = req.body[update];
    }
  });

  if (req.body.image && Array.isArray(req.body.image) && !req.files) {
    updateData.image = req.body.image;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("No valid fields provided for update", 400));
  }

  const product = await Product.findByIdAndUpdate(productId, updateData, {
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

  if (!products || products.length === 0)
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
