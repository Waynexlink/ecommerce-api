const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//signup cpontroller
const signupUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //heck if user exist in datavase
    const userExist = await User.findOne({ email });
    //if user does not exist send an error message
    //*IMPORTANT SET UP PROPER ERROR HANDLING *//
    if (userExist)
      return res.status(401).json({
        status: "fail",
        message: "this user already exist",
      });

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

    //send a success message on 201
  } catch (error) {
    //we cant use next error yet so use a normal error message
    console.log(error.name, error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //check if user exist in db
    const user = await User.findOne({ email });
    //send error if user does not exist in db and redirect to sign up
    if (!user)
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials ",
      });

    //use bcrypt to see if the password matches the stored password
    const confirmPassword = await bcrypt.compare(password, user.password);
    if (!confirmPassword)
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials ",
      });
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
  } catch (error) {
    console.log(error.name, error.message, error.stack);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
module.exports = { signupUser, loginUser };
