const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

// Helper: Find or create user
async function findOrCreate(profile, provider) {
  let user = await User.findOne({ email: profile.email });
  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      authProvider: provider,
      profileImage: profile.profileImage,
    });
  } else if (user.authProvider !== provider) {
    // If user exists with same email but different provider, update provider and profile image
    user.authProvider = provider;
    user.profileImage = profile.profileImage;
    await user.save();
  }
  return user;
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreate({
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0]?.value,
    }, 'google');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreate({
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0]?.value,
    }, 'facebook');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// LinkedIn
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreate({
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0]?.value,
    }, 'linkedin');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
