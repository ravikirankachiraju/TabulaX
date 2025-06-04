const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Required only for local signup
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'linkedin'],
    default: 'local',
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
