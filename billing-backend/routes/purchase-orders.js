const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const PurchaseOrder = require('../models/PurchaseOrder');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Helper: parse OCR text to extract purchase order details
function parsePurchaseOrderText(text) {
  // This is a simplified parser. In production, use regex and more logic.
  // For demo, just return mock data.
  return {
    products: [
      { no: 1, name: 'Sample Product', quantity: 2, unitPrice: 100, totalPrice: 200 },
      { no: 2, name: 'Another Product', quantity: 1, unitPrice: 300, totalPrice: 300 },
    ],
    subtotal: 500,
    gst: 90,
    totalAmount: 590,
    paymentMode: 'Cash',
    customerName: 'John Doe',
    contact: '9876543210',
  };
}

// POST /api/purchase-orders/upload
router.post('/upload', upload.single('bill'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const imagePath = req.file.path;
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    // Remove the uploaded file after OCR
    fs.unlinkSync(imagePath);
    // Parse the OCR text
    const extracted = parsePurchaseOrderText(text);
    // Save to DB
    const purchaseOrder = new PurchaseOrder({ ...extracted, imageUrl: imagePath });
    await purchaseOrder.save();
    res.json(purchaseOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process image', details: err.message });
  }
});

// GET /api/purchase-orders
router.get('/', async (req, res) => {
  const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router; 