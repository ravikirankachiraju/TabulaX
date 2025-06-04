const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Email/password
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), authController.oauthCallback);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), authController.oauthCallback);

// LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
router.get('/linkedin/callback', passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }), authController.oauthCallback);

// Example protected route
router.get('/protected', verifyToken, authController.protected);

module.exports = router;