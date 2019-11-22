const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

require("dotenv").config();
require("./modules/passport");

// routes
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api/users");
const profileRouter = require("./routes/api/profiles");
const articlesRouter = require("./routes/api/articles");

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

// session
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

//passport
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/", indexRouter);
app.use("/api/v1/users", apiRouter);
app.use("/api/v1/profiles", profileRouter);
app.use("api/v1/articles", articlesRouter);


// error handler

app.use((err,req,res,next)=> {
  res.status(500).json({err:"Unexpected error! Something wrong with your code."});
})

module.exports = app;
