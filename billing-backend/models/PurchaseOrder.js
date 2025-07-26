const mongoose = require('mongoose');

const ProductItemSchema = new mongoose.Schema({
  no: Number,
  name: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
}, { _id: false });

const PurchaseOrderSchema = new mongoose.Schema({
  products: [ProductItemSchema],
  subtotal: Number,
  gst: Number,
  totalAmount: Number,
  paymentMode: String,
  customerName: String,
  contact: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema); 