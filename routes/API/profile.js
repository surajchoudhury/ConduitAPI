const express = require("express");
const router = express.Router();
const auth = require("../../modules/auth");
const loggedUser = auth.verifyToken;
const User = require("../../models/user");

router.use(loggedUser);

// get user profile
router.get("/:username", (req, res) => {
  let username = req.params.username;
  console.log(req.user.user);
  User.findOne({ username }, "-password")
    .populate({
      path: "article",
      populate: {
        path: "author"
      }
    })
    .exec((err, profile) => {
      if (err)
        res.status(422).json({
          success: false,
          message: "unexpected error"
        });
      console.log(profile);
      res.status(200).json(profile);
    });
});

// follow user
router.post("/:username/follow", (req, res, next) => {
  let { username } = req.params.username;
  console.log(req.user.user);
  User.create({ username }, (err, user) => {
    if (err)
      res.status(422).json({
        success: false,
        message: "Unexpected error!"
      });
    if (!user.followers.includes(req.user.user.userId)) {
      User.findOneAndUpdate(
        { username },
        { $push: { followers: req.user.user.userId } },
        (err, followingUser) => {
          if (err)
            res.status(422).json({
              success: false,
              message: "Unexpected error!"
            });
        }
      );
    }
  });
});

module.exports = router;
