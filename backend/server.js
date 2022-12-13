const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const product = require("./routers/productroute");
const user = require("./routers/userroute");
const connectDB = require("./config/database");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");

// handling uncaught excepation

process.on("uncaughtException", (err) => {
  console.log(`Error :${err.message}`);
  console.log(`Shutting down due to unhandled promise rejection `);
  process.exit(1);
});

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// import Routers
app.use("/api", product);
app.use("/api", user);

// middleware for error
app.use(errorMiddleware);
// connect to database
connectDB();
app.get("/", (req, res) => res.send("Hello World!"));
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

//unhandle Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error :${err.message}`);
  console.log(`Shutting down due to unhandled promise rejection `);
  server.close(() => {
    process.exit(1);
  });
});
