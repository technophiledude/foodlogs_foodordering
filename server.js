const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Foodlogs API is running!');
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  console.log('Contact form submitted:', req.body);
  res.json({ 
    success: true, 
    message: 'Contact form received',
    data: req.body 
  });
});

// Order endpoint
app.post('/api/orders', (req, res) => {
  console.log('New order:', req.body);
  res.json({ 
    success: true, 
    message: 'Order received',
    orderId: 'ORDER-' + Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Foodlogs API running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  POST http://localhost:${PORT}/api/contact`);
  console.log(`  POST http://localhost:${PORT}/api/orders`);
});