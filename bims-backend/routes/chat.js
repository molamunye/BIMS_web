const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Basic endpoint for chat history (expand with Message model)
router.get('/history/:listingId', authMiddleware, async (req, res) => {
  // Mock for now – fetch from DB
  res.json({ messages: [{ from: 'client', text: 'Interested in house', timestamp: new Date() }] });
});

module.exports = router;