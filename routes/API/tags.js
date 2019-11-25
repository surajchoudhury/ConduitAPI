const express = require("express");
const router = express.Router();
const Tag = require("../../models/tag");

router.get("/", (req, res, next) => {
  Tag.find({})
    .populate({
      path: "article",
      populate: {
        path: "author"
      }
    })
    .exec((err, tags) => {
        if(err) return next(err);
        if(!tags) return res.json({message: "No tag found!"});
        return res.json({tags});
    });
});

module.exports = router;
