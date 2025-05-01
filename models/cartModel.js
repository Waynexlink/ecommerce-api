const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    sessionId: {
      type: String,
      required: false,
    },
    items: [
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
    expiredAt: {
      type: Date,
      default: new Date(Date.now + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
      index: { expires: "0s" },
    },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1, active: 1 });
cartSchema.index({ sessionId: 1, active: 1 });
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
