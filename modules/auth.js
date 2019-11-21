const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    jwt.verify(token, "jsonsecret", (err, decoded) => {
      if (err) return next(err);
      let user = {
        user: {
          email: decoded.email,
          token,
          username: decoded.username
        }
      };
      res.json(user);
    });
  } else {
    res.json({ success: false, message: "Token not found" });
  }
};

