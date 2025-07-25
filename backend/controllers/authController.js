const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');


exports.register = async (req, res) => {
  try {
    // console.log("INSIDE REGISTER USER")
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json(
        { message: 'All fields are required' }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        { message: 'Email already in use' }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(
        { username, email, password: hashedPassword }
    );
    res.status(200).json(
        { message: 'Registration successful', user: { _id: user._id, username: user.username, email: user.email } }
    );
  } catch (err) {
    res.status(500).json(
        { message: 'Server error', error: err.message }
    );
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(
        { message: 'All fields are required' }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(
        { message: 'Invalid credentials' }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(
        { message: 'Invalid credentials' }
      );
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json(
        { message: 'Login successful', user: { _id: user._id, username: user.username, email: user.email } }
    );
  } catch (err) {
    res.status(500).json(
        { message: 'Server error', error: err.message }
    );
  }
};

exports.googleLogin = async (req, res) => {
//   console.log("Inside Google Login");
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // Fetch Google User Info
    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { email, name } = googleRes.data;
    const dummyPassword = Math.random().toString(36).slice(-8); 
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    // Check if user exists in DB
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username: name, email, password: hashedPassword, googleAuth: true });
      await user.save();
    }

    // Generate JWT Token for session
    const appToken = jwt.sign(
      { id: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set cookie
    res.cookie("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to false for local testing if needed
      sameSite: "None",
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      token: appToken,
      user,
      email: user.email,
      message: "User Login Success",
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Google Authentication Failed" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "None",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
}; 