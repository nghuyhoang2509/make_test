const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(
  new GoogleStrategy({
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: '/auth/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({googleId: profile.id});

      if (existingUser) {
        return done(null, existingUser);
      }

      const user = await new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.name.familyName + ' ' + profile.name.givenName
      }).save();

      done(null, user);
    })
);