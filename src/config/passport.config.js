const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const {
  findOrCreateUser,
  findOrCreateLinkedInUser
} = require('../api/v1/services/authServices');
const config = require('../config/config');

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.redirectUri
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile, accessToken, refreshToken);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: config.linkedin.clientId,
      clientSecret: config.linkedin.clientSecret,
      callbackURL: config.linkedin.redirectUri
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateLinkedInUser(
          profile,
          accessToken,
          refreshToken
        );
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('../models/user/user.model');
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
module.exports = passport;
