require("dotenv").config();
const mongoose = require("mongoose");
const URL = process.env.MONGODB_URL;
const connectDB = () => {
  mongoose
    .connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log("database connected");
    })
};

module.exports = connectDB;
