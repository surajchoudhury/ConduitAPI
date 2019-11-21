const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    body: {
      type: String
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
