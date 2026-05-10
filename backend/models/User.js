const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    // Module 1: Profile Management fields
    profile: {
      brandName: { type: String, default: '' },
      brandDescription: { type: String, default: '' },
      niche: { type: String, default: '' },
      toneOfVoice: {
        type: String,
        enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational', ''],
        default: '',
      },
      preferredPlatforms: {
        type: [String],
        enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'],
        default: [],
      },
      avatarUrl: { type: String, default: '' },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
