const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Helper: create JWT
function createToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}


exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use.' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, authProvider: 'local' });
    const token = createToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required.' });
    const user = await User.findOne({ email, authProvider: 'local' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = createToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// OAuth Callbacks (Google, Facebook, LinkedIn)
exports.oauthCallback = async (req, res) => {
  // Passport attaches user to req.user after successful OAuth
  if (!req.user) return res.status(401).json({ message: 'OAuth failed.' });
  const token = createToken(req.user);
  // Redirect or respond with token (for SPA, send as query param or JSON)
  res.redirect(`http://localhost:5173/oauthsuccess?token=${token}`);
};

// Example protected route  
exports.protected = (req, res) => {
  res.json({ message: `Hello, ${req.user.name}! This is a protected route.` });
};
