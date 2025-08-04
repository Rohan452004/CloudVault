const ShortUrl = require('../models/ShortUrl');

// Generate a random short code
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create short URL
exports.createShortUrl = async (req, res) => {
  const { originalUrl, userId, expiresIn = 3600 } = req.body; // expiresIn in seconds

  if (!originalUrl) {
    return res.status(400).json({ message: 'Missing original URL' });
  }

  try {
    const shortCode = generateShortCode();
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));
    
    const shortUrlData = {
      shortCode,
      originalUrl,
      expiresAt
    };
    
    // Only add userId if it's provided and valid
    if (userId && userId !== "temp-user-id") {
      shortUrlData.userId = userId;
    }
    
    const shortUrl = new ShortUrl(shortUrlData);
    
    await shortUrl.save();
    
    // Return short URL using current domain
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const shortUrlString = `${baseUrl}/api/v1/short/${shortCode}`;
    
    return res.status(200).json({ 
      shortUrl: shortUrlString,
      originalUrl: originalUrl,
      expiresAt: expiresAt
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return res.status(500).json({ 
      message: 'Failed to create short URL',
      error: error.message 
    });
  }
};

// Redirect to original URL
exports.redirectToOriginal = async (req, res) => {
  const { shortCode } = req.params;
  
  try {
    // Find the short URL
    const shortUrl = await ShortUrl.findOne({ 
      shortCode, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!shortUrl) {
      return res.status(404).json({ 
        message: 'Short URL not found or expired' 
      });
    }
    
    // Increment click count
    shortUrl.clicks += 1;
    await shortUrl.save();
    
    // Redirect to original URL
    res.redirect(shortUrl.originalUrl);
  } catch (error) {
    console.error('Short URL redirect error:', error);
    res.status(500).json({ 
      message: 'Error processing short URL' 
    });
  }
};

// Cleanup expired URLs (can be run as a cron job)
exports.cleanupExpiredUrls = async () => {
  try {
    const result = await ShortUrl.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Cleaned up ${result.deletedCount} expired URLs`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}; 