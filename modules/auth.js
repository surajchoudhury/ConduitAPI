const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.secret, (err, decoded) => {
      if (err) return next(err);
      req.user = {
          userId: decoded.userId,
          email: decoded.email,
          token,
          avatar:decoded.avatar,
          bio:decoded.bio,
          username: decoded.username,
          followers:decoded.followers,
          following:decoded.following
      };
      next();
    });
  } else {
    res.status(401).json({ success: false, message: "Token not found" });
  }
};
