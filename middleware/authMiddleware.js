const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization ||
      req.headers.authorization.startWith("Bearer ")
    ) {
      const token = verify.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized ,no token or invalid format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser)
      return res.status(401).json({
        status: "fail",
        message: "Not authorized , token belongng to this user no longer exist",
      });

    req.user = currentUser;

    next();
  } catch (error) {
    console.log("Unauthorized middleware error", error.name, error.message);
    return res.status(401).json({
      message: "Not authorized token failed",
      status: "fail",
    });
  }
};
// const adminMiddleware = (req,res,nex)
module.exports = authMiddleware;
