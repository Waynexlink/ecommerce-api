const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
//signup cpontroller
const signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  //heck if user exist in datavase
  const userExist = await User.findOne({ email });
  //if user does not exist send an error message
  //*IMPORTANT SET UP PROPER ERROR HANDLING *//
  if (userExist) return next(new AppError("this user already exist", 400));

  //save the variable to the database using "User.create"
  const user = await User.create({ name, email, password });
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });
  res.status(201).json({
    status: "success",
    message: "user created successfully",
    token,
  });
});

const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if user exist in db
  const user = await User.findOne({ email });
  //send error if user does not exist in db and redirect to sign up
  if (!user) return next(new AppError("Invalid credentials ", 401));

  //use bcrypt to see if the password matches the stored password
  const confirmPassword = await bcrypt.compare(password, user.password);
  if (!confirmPassword) return next(new AppError("Invalid credentials ", 401));
  //create jwt token and store in req.user
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });
  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
  });
});
const forgotPassword = catchAsync(async (req, res, next) => {});
const resetPassword = catchAsync(async (req, res, next) => {});
module.exports = { signupUser, loginUser, forgotPassword, resetPassword };
