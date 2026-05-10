const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All profile routes require authentication
router.use(protect);

// ─── GET /api/profile ─────────────────────────────────────────────
// Get current user's profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ profile: user.profile, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
});

// ─── PUT /api/profile ─────────────────────────────────────────────
// Update current user's profile (brand details, tone, platforms)
router.put('/', async (req, res) => {
  try {
    const { name, brandName, brandDescription, niche, toneOfVoice, preferredPlatforms } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        'profile.brandName': brandName,
        'profile.brandDescription': brandDescription,
        'profile.niche': niche,
        'profile.toneOfVoice': toneOfVoice,
        'profile.preferredPlatforms': preferredPlatforms,
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

// ─── PUT /api/profile/password ────────────────────────────────────
// Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password.' });
  }
});

module.exports = router;
