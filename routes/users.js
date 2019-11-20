const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const auth = require("../modules/auth")
const logged = auth.authenticate;

// register user

router.post("/", (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) return next(err);
    res.json({ user });
  });
});

// login
router.post("/login", (req, res, next) => {
  let { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) res.json({ success: false, message: "Invalid Email ID" });
    user.verifyPassword(password, (err, matched) => {
      if (err) return next(err);
      if (!matched) res.json({ success: false, message: "invalid password" });

      //  jwt authentication

      jwt.sign(
        { userId: user._id, email: user.email, username: user.username },
        "jsonsecret",
        (err, token) => {
          if (err) return next(err);
          res.json({ success: true, message: "you are logged in", token });
        }
      );
    });
  });
});

// test protected route

router.get("/protected",logged,(req,res)=> {
  res.json({success:true,
  message:'you are authorized'});
})

const articlesRouter = require("./articles");
router.use('/articles',articlesRouter);

module.exports = router;
