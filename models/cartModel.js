const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productQuantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
cart.virtual("totalPrice ").get(function () {
  return this.product.reduce;
  (total, product) => {
    return total + product.quantity;
  };
});
cartSchema.index({ userId: 1, active: 1 });
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
