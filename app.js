const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

// routes
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/users");

// connecting app to mongodb
mongoose.connect(
  "mongodb://localhost/conduit",
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    console.log("Connected to mongoDB", err ? false : true);
  }
);

// initializing express in App
const app = express();

// middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", indexRouter);
app.use("/api/v1/users", apiRouter);

module.exports = app;
