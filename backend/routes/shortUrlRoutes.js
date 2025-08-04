const express = require('express');
const router = express.Router();
const { 
  createShortUrl, 
  redirectToOriginal, 
} = require('../controllers/urlShortenerController');

// Create short URL
router.post('/create', createShortUrl);

// Redirect to original URL (this will be the main route for short URLs)
router.get('/:shortCode', redirectToOriginal);

module.exports = router; 