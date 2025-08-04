const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make it optional
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
shortUrlSchema.index({ shortCode: 1 });
shortUrlSchema.index({ expiresAt: 1 });
shortUrlSchema.index({ userId: 1 });

module.exports = mongoose.model('ShortUrl', shortUrlSchema); 