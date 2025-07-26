const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const BillSchema = new mongoose.Schema({
  billNumber: { type: String, required: true },
  billDate: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  items: { type: [BillItemSchema], required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Paid' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', BillSchema); 