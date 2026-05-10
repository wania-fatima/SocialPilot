const mongoose = require('mongoose');

// Schema for individual posts in the calendar
const postSchema = new mongoose.Schema({
  day: { type: Number, required: true },           // day number in campaign (1-30)
  date: { type: Date },
  platform: {
    type: String,
    enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'],
    required: true,
  },
  postType: {
    type: String,
    enum: ['Reel', 'Carousel', 'Thread', 'Story', 'Static', 'Article'],
    required: true,
  },
  caption: { type: String, default: '' },
  hashtags: [String],
  visualIdea: { type: String, default: '' },
  postingTime: { type: String, default: '' },    // e.g. "6:00 PM"
  // Module 3: Engagement prediction fields
  predictedLikes: { type: Number, default: 0 },
  predictedComments: { type: Number, default: 0 },
  predictedReach: { type: Number, default: 0 },
  performanceFlag: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    default: 'yellow',
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'rejected'],
    default: 'draft',
  },
});

const campaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Module 2: Campaign Input fields
    campaignName: { type: String, required: true, trim: true },
    niche: { type: String, required: true },
    brandName: { type: String, required: true },
    brandDescription: { type: String, default: '' },
    toneOfVoice: {
      type: String,
      enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational'],
      required: true,
    },
    goals: [String],                              // e.g. ['increase followers', 'drive sales']
    targetPlatforms: {
      type: [String],
      enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'],
      required: true,
    },
    duration: { type: Number, default: 30 },      // days: 7, 15, or 30
    customInstructions: { type: String, default: '' },
    startDate: { type: Date, default: Date.now },

    // Module 3: Calendar data
    posts: [postSchema],

    // Campaign-level stats
    stats: {
      totalPredictedReach: { type: Number, default: 0 },
      avgEngagementRate: { type: Number, default: 0 },
      totalPosts: { type: Number, default: 0 },
      approvedPosts: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ['draft', 'generating', 'active', 'completed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
