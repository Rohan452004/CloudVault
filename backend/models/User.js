const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  googleAuth: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


userSchema.pre('save', async function(next) {
  // Only create folder for new users
  if (this.isNew) {
    // console.log("Creating S3 folder for new user");
    // console.log(process.env.PLATFORM_AWS_ACCESS_KEY_ID);
    // console.log(process.env.PLATFORM_AWS_SECRET_ACCESS_KEY);
    // console.log(process.env.PLATFORM_AWS_REGION);
    // console.log(process.env.PLATFORM_S3_BUCKET);
    const s3 = new AWS.S3({
      accessKeyId: process.env.PLATFORM_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.PLATFORM_AWS_SECRET_ACCESS_KEY,
      region: process.env.PLATFORM_AWS_REGION,
    });
    const bucket = process.env.PLATFORM_S3_BUCKET;
    const key = `users/${this._id}/`; 
    try {
      await s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: '', 
      }).promise();
      console.log(`Created S3 folder: ${key}`);
    } catch (err) {
      console.error('Failed to create user S3 folder:', err);
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 