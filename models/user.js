const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      match: /@/,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    bio: {
      type: String
    },
    following: {
      type: [String]
    },
    followers: {
      type: [String]
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article"
    }
  },
  { timestamps: true }
);

userSchema.pre("save", function(next) {
  if (this.password && this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, password) => {
      if (err) return next(err);
      this.password = password;
      next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, matched) => {
    if (err) return done(null, false);
    done(null, matched);
  });
};

module.exports = mongoose.model("User", userSchema);
