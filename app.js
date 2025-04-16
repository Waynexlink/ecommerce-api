const express = require("express");
const globalErrorHandler = require("./controller/errorController");
const AppError = require("./utils/AppError");
const app = express();

const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);

//*IMPORTANT*//
//handling unregistered routes
// app.all(`${*}`, (req, res) => {
//   next(
//     new AppError(
//       `This route is not registered ${req.originalUrl} on this server`
//     ),
//     404
//   );
// });

app.use(globalErrorHandler);

module.exports = app;
