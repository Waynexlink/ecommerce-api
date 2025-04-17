const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "A user should have a name"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "A user should have an email"],
      index: true,
      validator: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "A user should have a password"],
      minlength: [6, "A Password shold not be less than 6 digits"],
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
      uppercase: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.method.createPasswordResetToken = function () {
  //generate plain token
  const resetToken = crypto.randomBytes(32).toString("hex");

  //hash the reset token before saving to the database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now + 10 * 60 * 1000;
  //return plain token
  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
