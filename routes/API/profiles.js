const express = require("express");
const router = express.Router();
const auth = require("../../modules/auth");
const loggedUser = auth.verifyToken;
const User = require("../../models/user");

router.use(loggedUser);

// get user profile
router.get("/:username", (req, res) => {
  let username = req.params.username;
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
      res.status(200).json(profile);
    });
});


// follow user
router.post("/:username/follow", (req, res, next) => {
  let username = req.params.username;
  User.findOne({ username }, (err, user) => {
    if (err)
      return res.status(422).json({
        success: false,
        message: "Unexpected error!"
      });
    if (!user.followers.includes(req.user.username)) {
      User.findOneAndUpdate(
        { username },
        { $push: { followers: req.user.username } },{new:true},
        (err, followingUser) => {
          if (err)
            return res.status(422).json({
              success: false,
              message: "Unexpected error!"
            });
          if (!followingUser) {
            res.json({
              success: false,
              message: "User not found"
            });
            let currentUser = req.user.username;
            console.log(currentUser,"here in the followers");
            User.findOneAndUpdate(
              { currentUser },
              { $push: { following: followingUser.username } },
              (err, currentUser) => {
                if (err)
                  return res.status(422).json({
                    success: false,
                    message: "can not add user to following list"
                  });
                if (!currentUser)
                  return res.status(422).json({
                    success: false,
                    message: "User not found"
                  });
                res.json({ currentUser, followingUser });
              }
            );
          }
        }
      );
    } else {
        res.json({user});
    }
  });
});

module.exports = router;
