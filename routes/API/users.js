const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../../modules/auth");
const loggedUser = auth.verifyToken;

// oAuth github login

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate(
    "github",
    { failureRedirect: "/api/v1/users/login" },
    (req, res) => {
      res.json({
        success: true,
        message: "successfully loggedin through github"
      });
    }
  )
);

// register user

router.post("/", (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) return next(err);
    res.json(user);
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
        {
          userId: user._id,
          email: user.email,
          username: user.username,
          image: user.image,
          bio: user.bio,
          followers: user.followers,
          following: user.following
        },
        process.env.secret,
        (err, token) => {
          if (err) return next(err);
          res.json({ success: true, message: "you are logged in", token });
        }
      );
    });
  });
});

////////////////////////// only current logged user can access //////////////////////

router.use(loggedUser);

// get the current user

router.get("/", (req, res, next) => {
  let { username } = req.user;
  User.findOne({ username }, "-password", (err, user) => {
    if (err)
      return res.status(422).json({
        errors: {
          body: "unexpected error!"
        }
      });
    res
      .contentType("application/json")
      .status(200)
      .json(user);
  });
});

// update current user

router.put("/", (req, res, next) => {
  let { username } = req.user;
  User.findOneAndUpdate({ username }, req.body, { new: true }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(422).json("User not found!");
    res
      .contentType("application/json")
      .status(200)
      .json(user);
  });
});

module.exports = router;
