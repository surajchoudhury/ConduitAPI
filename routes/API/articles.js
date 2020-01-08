const express = require("express");
const router = express.Router();
const Article = require("../../models/article");
const Comment = require("../../models/comment");
const auth = require("../../modules/auth");
const User = require("../../models/user");
const Tag = require("../../models/tag");
const loggedUser = auth.verifyToken;

/////////////////////////////////////// articles /////////////////////////////////////////

// get recent articles globally

router.get("/", (req, res, next) => {
  Article.find({})
    .populate("author", "-password")
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
      user.following.forEach(followingUser => {
        Article.find({ author: followingUser._id })
          .populate("author", "-password")
          .exec((err, articleFeeds) => {
            if (err) return next(err);
            return res.json({ success: true, articleFeeds });
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
    .populate({
      path: "author",
      populate: {
        path: "article",
        populate: "author"
      }
    })
    .populate({
      path: "comments",
      populate: {
        path: "author"
      }
    })
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
  req.body.userId = req.user.userId;
  Article.create(req.body, (err, createdArticle) => {
    if (err) return next(err);
    if (!createdArticle)
      return res.json({
        success: false,
        message: "no articles to post!"
      });
    Article.findByIdAndUpdate(
      createdArticle._id,
      { author: req.body.userId },
      (err, updated) => {
        if (err) return next(err);
      }
    );
    createdArticle.tagList.split(",").forEach(tag => {
      Tag.findOne({ body: tag }, (err, foundTag) => {
        if (err) return next(err);
        if (!foundTag) {
          Tag.create(
            { article: createdArticle._id, body: tag },
            (err, createdTag) => {
              if (err) return next(err);
            }
          );
        } else if (foundTag) {
          Tag.findByIdAndUpdate(
            foundTag._id,
            { $push: { article: createdArticle } },
            { new: true },
            (err, createdTag) => {
              if (err) return next(err);
            }
          );
        }
      });
    });
    User.findByIdAndUpdate(
      req.body.userId,
      { $push: { article: createdArticle._id } },
      (err, updatedArticle) => {
        if (err) return next({ err });
      }
    );
    if (err) res.json({ message: "Can't create Article" });
    res
      .status(200)
      .json({ success: true, message: "Article Published Succesfully!" });
  });
});

// update article

router.put("/:slug", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOne({ slug }, (err, article) => {
    if (err) return next(err);
    // console.log(req.user.userId, article.userId);
    // if (req.user.userId == article.userId) {
    Article.findOneAndUpdate({ slug }, req.body, (err, updatedArticle) => {
      if (err) return next(err);
      if (!article)
        return res.json({
          success: false,
          message: "no articles to update!"
        });
      res.status(200).json(updatedArticle);
    });
    // } else {
    //   res.json({ success: false, message: "You can't delete this article!" });
    // }
  });
});

// delete article

router.delete("/:slug", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOne({ slug }, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({
        success: false,
        message: "no articles to found!"
      });
    Article.findOneAndDelete({ slug }, (err, articleToDelete) => {
      if (err) return next(err);
      if (!articleToDelete) {
        return res.json({ success: false, message: "No Article found!" });
      }
      res
        .status(200)
        .json({ success: true, message: "Article deleted succesfully" });
    });
  });
});

/////////////////////////////////////// comments //////////////////////////////////////////

// post comments

router.post("/:slug/comments", (req, res, next) => {
  let userId = req.user.userId;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    if (!comment)
      return res.json({
        success: false,
        message: "No comments to post!"
      });
    Comment.findByIdAndUpdate(
      comment._id,
      { author: userId },
      (err, updateUser) => {
        if (err) return next(err);
      }
    );
    Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $push: { comments: comment._id } },
      { new: true },
      (err, article) => {
        res
          .status(200)
          .json({ success: true, message: "Comment added!", comment });
      }
    );
  });
});

// delete comment

router.delete("/:slug/comments/:id", (req, res, next) => {
  let id = req.params.id;
  let slug = req.params.slug;
  Article.findOneAndUpdate(
    { slug },
    { $pull: { comments: id } },
    { new: true },
    (err, article) => {
      if (err) return next(err);
      if (!article)
        return res.json({ success: false, message: "No article found!" });
    }
  );
  Comment.findByIdAndDelete(id, (err, comment) => {
    if (err) return next(err);
    if (!comment)
      return res.json({
        success: false,
        message: "no comments to Delete!"
      });
    res.json({
      success: true,
      message: "comment deleted Succesfully"
    });
  });
});

//favourite an Article

router.post("/:slug/favorite", (req, res, next) => {
  let slug = req.params.slug;
  Article.findOne({ slug }, (err, article) => {
    if (err) return next(err);
    if (!article)
      return res.json({ success: false, message: "No article Found!" });
    Article.findOneAndUpdate(
      { slug },
      { $push: { favorites: req.user.userId } },
      { new: true },
      (err, favoritedArticle) => {
        if (err) return next(err);
        favoritedArticle.favoritesCount++;
        User.findOneAndUpdate(
          { username: req.user.username },
          { $push: { favorited: article._id } },
          { new: true },
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
      { $pull: { favorites: req.user.userId } },
      { new: true },
      (err, unfavoritedArticle) => {
        if (err) return next(err);
        unfavoritedArticle.favoritesCount - 1;
        User.findOneAndUpdate(
          { username: req.user.username },
          { $pull: { favorited: article._id } },
          { new: true },
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
