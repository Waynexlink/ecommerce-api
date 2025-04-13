require("dotenv").config();

const dbConnect = require("./config/db");

//handling uncaught exception
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION , Shutting down ...");
  console.error(err.name, err.message);
  process.exit(1);
});

//intializing app
const app = require("./app");

dbConnect();

//intializing server

const port = process.env.PORT;
const environment = process.env.NODE_ENV || development;
const server = app.listen(port, () => {
  console.log(`server started at ${port} in ${environment}`);
});

//handling uncaughtrejection
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION , Shutting down ...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
