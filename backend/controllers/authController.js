const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });

    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} already taken` });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const getMe = async (req, res) => {
  try {
    return res.json({ success: true, user: req.user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;

    await req.user.update(updates);
    return res.json({ success: true, user: req.user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
};

const getChannel = async (req, res) => {
  try {
    const { userId } = req.params;
    const channel = await User.findByPk(userId);
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });
    return res.json({ success: true, channel: channel.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get channel' });
  }
};

module.exports = { register, login, getMe, updateProfile, getChannel };
