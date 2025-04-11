const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected succesfully");
  } catch (err) {
    console.log("Database connection error", err);
    process.exit(1);
  }
};

module.exports = dbConnect;
