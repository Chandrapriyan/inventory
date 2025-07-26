const express = require('express');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const History = require('../models/History');
const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  const bills = await Bill.find();
  res.json(bills);
});

// Add a bill and create a selling order
router.post('/', async (req, res) => {
  const bill = new Bill(req.body);
  await bill.save();

  // Create a selling order from the bill
  const order = new Order({
    orderId: bill.billNumber,
    customerId: bill.customerId, // Pass customerId from bill
    customerName: bill.customerName,
    date: bill.billDate,
    items: bill.items,
    total: bill.total,
    status: 'Processing',
  });
  await order.save();

  // Log history
  await History.create({
    type: 'bill',
    refId: bill.billNumber,
    action: 'created',
    details: `Bill for ${bill.customerName}, total ₹${bill.total}`,
  });

  res.status(201).json(bill);
});

// Update a bill
router.put('/:id', async (req, res) => {
  const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bill);
});

// Delete a bill
router.delete('/:id', async (req, res) => {
  await Bill.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router; 