const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Mock scan-bill endpoint
router.post('/', upload.single('bill'), async (req, res) => {
  // In a real implementation, you would process the file (OCR, etc.)
  // Here, return mock data
  res.json({
    supplier: "ABC Suppliers Ltd.",
    totalAmount: 15420.50,
    items: [
      { name: "Office Chairs", quantity: 5, price: 2500.00 },
      { name: "Desk Lamps", quantity: 10, price: 450.00 },
      { name: "Paper Reams", quantity: 20, price: 350.00 },
      { name: "Printer Cartridges", quantity: 8, price: 1200.00 }
    ],
    createdAt: new Date().toISOString()
  });
});

module.exports = router; 