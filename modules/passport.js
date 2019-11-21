const passport = require("passport");
const githubStrategy = require("passport-github").Strategy;
const User = require("../models/user");

passport.use(
  new githubStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.callbackURL
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(null, false);
        if (!user) {
          let user = {
            username: profile.username,
            email: profile._json.email,
            bio: profile._json.bio,
            image: profile._json.avatar_url
          };
          User.create(user, (err, user) => {
            if (err) return done(null, false);
            done(null, user);
            console.log(user);
          });
        }
        done(null, user);
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) return done(err, false);
    done(null, user);
  });
});
