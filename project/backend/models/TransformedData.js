const mongoose = require('mongoose');

const TransformedDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  columns: { type: [String], required: true },
  rawData: { type: [[mongoose.Schema.Types.Mixed]], required: true },
  createdAt: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('TransformedData', TransformedDataSchema);
