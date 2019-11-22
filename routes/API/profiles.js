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

// router.post("/:username/follow", async (req, res, next) => {
//   try {
//     let otherUser = await User.findOne({ username: req.params.username });
//     if (otherUser && !otherUser.followers.includes(req.user.username)) {
//       let other = await User.findByIdAndUpdate(otherUser.id, { $push: { followers: req.user.username }},{ new: true });
//       let user = await User.findByIdAndUpdate(req.user.userId, { $push: { following: otherUser.username }}, { new: true });
//       res.json({ other,user });
//     } else if (otherUser.followers.includes(req.user.username)) {
//       res.json({ msg: "Already following"})
//     } else {
//       res.json({ msg: "User not found" })
//     }

//   } catch (err) {
//     return next(err);
//   }
// });

router.post("/:username/follow", (req, res, next) => {
  let username = req.params.username;
  let currentUser = req.user.userId;
  User.findOne({ username }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.json({ success: false, message: "user not found!" });
    if (!user.followers.includes(req.user.username)) {
      User.findOneAndUpdate(
        { username },
        { $push: { followers: req.user.username } },
        { new: true },
        (err, followingUser) => {
          if (err) return next(err);
          if (!followingUser)
            return res.json({ success: false, message: "User not found!" });
          User.findByIdAndUpdate(
            currentUser,
            { $push: { following: followingUser.username } },
            { new: true },
            (err, currentuser) => {
              if (err) return next(err);
              res.json({ followingUser, currentuser });
            }
          );
        }
      );
    } else {
      res.json({ user });
    }
  });
});

// // unfollow user

// router.delete("/:username/follow", async (req, res, next) => {
//   try {
//     let otherUser = User.findOne({ username: req.params.username });
//     if (otherUser && otherUser.followers.includes(req.user.username)) {
//       let other = await User.findByIdAndUpdate(
//         otherUser._id,
//         { $pull: { followers: req.user.username } },
//         { new: true }
//       );
//       let user = await User.findByIdAndUpdate(
//          req.user.userId ,
//         { $pull: { following: otherUser.username } },
//         { new: true }
//       );
//       res.json({ other, user });
//     } else if (!otherUser.followers.includes(req.user.username)) {
//       res.json({ mgs: "Not following" });
    
//     } else {
//       res.json({msg:"User not found!"});
//     }
//   } catch (error) {
//     return next(error);
//   }
// });

router.delete("/:username/follow", (req, res, next) => {
  let username = req.params.username;
  let currentUser = req.user.userId;
  User.findOne({ username }, (err, user) => {
    if (err) return next(err);
    if (user.followers.includes(req.user.username)) {
      User.findOneAndUpdate(
        { username },
        { $pull: { followers: req.user.username } },
        { new: true },
        (err, unfollowUser) => {
          if (err) return next(err);
          if (!unfollowUser)
            return res.json({ success: false, message: "User not found!" });
          User.findByIdAndUpdate(
            currentUser,
            { $pull: { following: unfollowUser.username } },
            { new: true },
            (err, currentuser) => {
              if (err) return next(err);
              res.json({ unfollowUser, currentuser });
            }
          );
        }
      );
    } else {
      res.json({ user });
    }
  });
});

module.exports = router;
