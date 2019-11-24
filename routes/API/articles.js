const express = require("express");
const router = express.Router();
const Article = require("../../models/article");
const Comment = require("../../models/comment");
const auth = require("../../modules/auth");
const User = require("../../models/user");
const loggedUser = auth.verifyToken;

/////////////////////////////////////// articles /////////////////////////////////////////

// get recent articles globally

router.get("/", (req, res, next) => {
  Article.find({})
    .populate("author", "username email")
    .exec((err, articles) => {
      if (err) return next(err);
      if (!articles)
        return res.json({
          success: false,
          message: "no articles found!"
        });
      res.json({ articles });
    });
});

// get recent articles from users you follow .

router.get("/feed", loggedUser, (req, res, next) => {
  User.findOne({ username: req.user.username }, (err, user) => {
    if (err) return next(err);
    if (user.following.length) {
      user.following.forEach(user => {
        Article.find({ username: user })
          .populate("author", "username")
          .exec((err, articles) => {
            if (err) return next(err);
            return res.json({ articles });
          });
      });
    } else {
      res.json({ success: false, message: "follow to get feeds!" });
    }
  });
});

// get single article

router.get("/:slug", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOne({ slug })
    .populate("author", "username email")
    .exec((err, article) => {
      if (err) return next(err);
      if (!article)
        return res.json({
          success: false,
          message: "enter valid article slug!"
        });
      res.json(article);
    });
});

// /////////////////////////////// logged user can only access //////////////////////////

router.use(loggedUser);

// post article

router.post("/", (req, res, next) => {
  Article.create(req.body, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({
        success: false,
        message: "no articles to post!"
      });
    res.json(article);
  });
});

// update article

router.put("/:slug", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOneAndUpdate({ slug }, req.body, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({
        success: false,
        message: "no articles to update!"
      });
    res.json(article);
  });
});

// delete article

router.delete("/:slug", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOneAndDelete({ slug }, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({
        success: false,
        message: "no articles to delete!"
      });

    res.json({ success: true, message: "Article deleted succesfully" });
  });
});

// ///////////////////////////////////// comments //////////////////////////////////////////

// post comments
router.post("/:slug/comments", (req, res, next) => {
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    if (!comment)
      return res.json({
        success: false,
        message: "No comments to post!"
      });
    Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $push: { comments: comment._id } },
      { new: true },
      (err, article) => {
        res.json(comment);
      }
    );
  });
});

// get comments

router.get("/:slug/comments", (req, res, next) => {
  Comment.find({}, (err, comments) => {
    if (err) return next(err);
    if (!comments)
      return res.json({
        success: false,
        message: "no comments found!"
      });
    res.json({ comments });
  });
});

// get comment

router.get("/:slug/comments/:id", (req, res, next) => {
  let id = req.params.id;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    if (!comment)
      return res.json({
        success: false,
        message: "comment not found!"
      });
    res.json(comment);
  });
});

// update comment

router.put("/:slug/comments/:id", (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body, (err, comment) => {
    if (err) return next(err);
    if (!comment)
      return res.json({
        success: false,
        message: "no comments to update!"
      });
    res.json(comment);
  });
});

// delete comment

router.delete("/:slug/comments/:id", (req, res, next) => {
  let id = req.params.id;
  Comment.findByIdAndDelete(id, (err, comment) => {
    if (err) return next(err);
    if (!comment)
      return res.json({
        success: false,
        message: "no comments to Delete!"
      });
    res.json({
      succes: true,
      message: "comment deleted Succesfully"
    });
  });
});

//favourite an Article

router.post("/:slug/favorite", (req, res, next) => {
  let slug = req.params.slug;
  console.log(req.user);
  Article.findOne({ slug }, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({ success: false, message: "No article Found!" });
    Article.findOneAndUpdate(
      { slug },
      { $push: { favorites: req.user.userId } },{new:true},
      (err, favoritedArticle) => {
        if (err) return next(err);
        favoritedArticle.favoritesCount++;
        User.findOneAndUpdate(
          { username: req.user.username },
          { $push: { favorited: article._id } },{new:true},
          (err, favoritedUser) => {
            if (err) return next(err);
            res.json({ favoritedArticle, favoritedUser });
          }
        );
      }
    );
  });
});

// Unfavourite an Article

router.delete("/:slug/favorite", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOne({ slug }, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({ success: false, message: "No article Found!" });
    Article.findOneAndUpdate(
      { slug },
      { $pull: { favorites: req.user.userId } },{new:true},
      (err, unfavoritedArticle) => {
        if (err) return next(err);
        unfavoritedArticle.favoritesCount-1;
        User.findOneAndUpdate(
          { username: req.user.username },
          { $pull: { favorited: article._id } },{new:true},
          (err, unfavoritedUser) => {
            if (err) return next(err);
            res.json({ unfavoritedArticle, unfavoritedUser });
          }
        );
      }
    );
  });
});

module.exports = router;
