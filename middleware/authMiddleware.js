const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const requireAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization ||
    req.headers.authorization.startWith("Bearer ")
  ) {
    const token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError("Not authorized ,no token or invalid format", 401)
    );

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select("-password");
  if (!currentUser)
    return new AppError(
      "Not authorized , token belonging to this user no longer exist",
      401
    );

  req.user = currentUser;

  next();
});
const requireAdmin = catchAsync((req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  }
});
module.exports = { requireAuth, requireAdmin };
