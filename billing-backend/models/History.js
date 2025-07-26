const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'bill' or 'order'
  refId: { type: String, required: true }, // billNumber or orderId
  action: { type: String, required: true }, // e.g. 'created', 'updated', 'deleted'
  details: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('History', HistorySchema); 