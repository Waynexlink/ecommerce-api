const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/emailSender");
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
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Please provide your email", 400));

  const user = User.findOne({ email });

  res.status(200).json({
    status: "success",
    message:
      "If a user with that email exists, a password reset link has been sent.",
  });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Seems like you forgot your password ,if this is true ,click on the link below to reset your password\n ${resetURL}\n\nIf you didn’t request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset your password",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500
      )
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError("Please provide and confirm your new password.", 400)
    );
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match.", 400));
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.find({
    passwordResetToken: hashedToken,
    passwordResetExpires: { gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });
  res.status(200).json({
    status: "success",
    message: "Password successfully reset.",
    token,
  });
});
module.exports = { signupUser, loginUser, forgotPassword, resetPassword };
