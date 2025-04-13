const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 1,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((img) =>
            /^https?:\/\/.*\.(jpg|jpeg|png)$/.test(img)
          );
        },
        message: "Invalid image Url format",
      },
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
