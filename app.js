const express = require("express");
const app = express();

const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);

module.exports = app;
