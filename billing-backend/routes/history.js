const express = require('express');
const History = require('../models/History');
const router = express.Router();

// Get all history records
router.get('/', async (req, res) => {
  const history = await History.find();
  res.json(history);
});

// Add a history record
router.post('/', async (req, res) => {
  const record = new History(req.body);
  await record.save();
  res.status(201).json(record);
});

module.exports = router; 