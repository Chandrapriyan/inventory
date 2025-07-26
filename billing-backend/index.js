require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// API Key Middleware
// app.use((req, res, next) => {
//   const apiKey = req.headers['x-api-key'];
//   if (apiKey !== process.env.API_KEY) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   next();
// });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Billing backend running' });
});

// API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/history', require('./routes/history'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/scan-bill', require('./routes/scan-bill'));
app.use('/api/purchase-orders', require('./routes/purchase-orders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 