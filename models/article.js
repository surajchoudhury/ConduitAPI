const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("slug");

const articleSchema = new Schema(
  {
    slug: {
      type: String
    },
    title: {
      type: String,
      require: true
    },
    description: {
      type: String
    },
    body: {
      type: String
    },
    tagList: [String],
    favorited: Boolean,
    favoritesCount: {
      type: Number,
      default: 0
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    comments: {
      type: [String]
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
  },
  { timestamps: true }
);

articleSchema.pre("save", function(next) {
  if (this.title && this.isModified("title")) {
    var slugged = slug(this.title, { lower: true });
    this.slug = slugged;
    next();
  } else {
    next();
  }
});

module.exports = mongoose.model("Article", articleSchema);
