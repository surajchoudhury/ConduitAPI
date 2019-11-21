const express = require("express");
const router = express.Router();
const Article = require("../../models/article");
const Comment = require("../../models/comment");

///////////////////////////////////////// articles /////////////////////////////////////////

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

// get all articles

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
    if (!comment) return res.json({
        success:false, 
        message:"No comments to post!"});
    res.json(comment);
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
           message: "commentId not found!"
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
      message: "comment deleted succesfully"
    });
  });
});

module.exports = router;
