const express = require('express');
const Order = require('../models/Order');
const History = require('../models/History');
const router = express.Router();

// Get all selling orders
router.get('/', async (req, res) => {
  const sellingOrders = await Order.find();
  res.json({ sellingOrders });
});

// Add a selling order
router.post('/', async (req, res) => {
  const order = new Order(req.body);
  await order.save();

  // Log history
  await History.create({
    type: 'order',
    refId: order.orderId,
    action: 'created',
    details: `Order for ${order.customerName}, total ₹${order.total}`,
  });

  res.status(201).json(order);
});

// Delete an order
router.delete('/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router; 