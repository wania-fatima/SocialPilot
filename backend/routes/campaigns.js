const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/auth');

// All campaign routes are protected
router.use(protect);

// ─── Simulated content generation (Module 2 → Module 3) ──────────
// In a real app this would call your AI agents (CrewAI / OpenAI)
// For now it generates realistic mock data so your UI fully works
function generateCalendarPosts(campaignData) {
  const { targetPlatforms, duration, startDate, toneOfVoice, niche } = campaignData;
  const postTypes = {
    Instagram: ['Reel', 'Carousel', 'Story', 'Static'],
    Twitter: ['Thread', 'Static'],
    Facebook: ['Static', 'Story', 'Carousel'],
    LinkedIn: ['Article', 'Static', 'Carousel'],
    TikTok: ['Reel', 'Story'],
  };

  const sampleCaptions = {
    professional: [
      `Elevate your ${niche} strategy with proven insights. Here's what the data tells us. 💼`,
      `The future of ${niche} is changing — are you ready? Let's explore the key trends.`,
      `3 ways to optimize your ${niche} approach for maximum ROI in 2025. Thread below 👇`,
    ],
    casual: [
      `Okay so I've been obsessed with ${niche} lately and I NEED to share this 🙌`,
      `Hot take: most people are sleeping on this ${niche} hack. Save this for later!`,
      `Just sharing what's been working for us in ${niche} — no gatekeeping here! ✨`,
    ],
    humorous: [
      `Me before ${niche}: 😅 Me after: 😎 The glow-up is real.`,
      `${niche} but make it chaotic good. Who else relates? 😂`,
      `Plot twist: ${niche} is actually fun when you stop overthinking it 👀`,
    ],
    inspirational: [
      `Your ${niche} journey is unique. Stop comparing and start creating. 🌟`,
      `Every expert in ${niche} was once a beginner. Your progress matters. 💪`,
      `Success in ${niche} isn't overnight — it's showing up every day. Let's go!`,
    ],
    educational: [
      `📚 ${niche} 101: A beginner's guide to getting started. Save this!`,
      `Did you know? Here are 5 ${niche} facts most people don't know about.`,
      `Breaking down the science of ${niche} in simple terms. Let's learn together 🧵`,
    ],
  };

  const hashtagSets = [
    [`#${niche.replace(/\s+/g, '')}`, '#ContentCreator', '#SocialMedia', '#Growth', '#Marketing'],
    [`#${niche.replace(/\s+/g, '')}Tips`, '#Trending', '#DigitalMarketing', '#Engagement', '#Viral'],
    [`#${niche.replace(/\s+/g, '')}Community`, '#SmallBusiness', '#Entrepreneur', '#Brand', '#Online'],
  ];

  const postingTimes = ['8:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'];
  const flags = ['green', 'green', 'green', 'yellow', 'red'];

  const posts = [];
  const start = new Date(startDate || Date.now());

  for (let day = 1; day <= duration; day++) {
    // Pick a platform (cycle through selected platforms)
    const platform = targetPlatforms[day % targetPlatforms.length];
    const types = postTypes[platform] || ['Static'];
    const postType = types[day % types.length];

    const captionOptions = sampleCaptions[toneOfVoice] || sampleCaptions['casual'];
    const caption = captionOptions[day % captionOptions.length];
    const hashtags = hashtagSets[day % hashtagSets.length];

    // Simulated engagement prediction
    const baseLikes = Math.floor(Math.random() * 500) + 100;
    const baseComments = Math.floor(baseLikes * 0.05);
    const baseReach = baseLikes * (Math.floor(Math.random() * 5) + 3);

    const postDate = new Date(start);
    postDate.setDate(start.getDate() + day - 1);

    posts.push({
      day,
      date: postDate,
      platform,
      postType,
      caption,
      hashtags,
      visualIdea: `Create a ${postType} showcasing your ${niche} brand — use bold colors and clear text overlay.`,
      postingTime: postingTimes[day % postingTimes.length],
      predictedLikes: baseLikes,
      predictedComments: baseComments,
      predictedReach: baseReach,
      performanceFlag: flags[day % flags.length],
      status: 'draft',
    });
  }

  return posts;
}

// ─── POST /api/campaigns ──────────────────────────────────────────
// Create a new campaign (Module 2: Campaign Input)
router.post('/', async (req, res) => {
  try {
    const {
      campaignName, niche, brandName, brandDescription,
      toneOfVoice, goals, targetPlatforms, duration,
      customInstructions, startDate,
    } = req.body;

    // Validation
    if (!campaignName || !niche || !brandName || !toneOfVoice || !targetPlatforms?.length) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Generate calendar posts (replace with real AI call later)
    const posts = generateCalendarPosts({
      targetPlatforms, duration: duration || 30,
      startDate, toneOfVoice, niche,
    });

    // Calculate campaign-level stats
    const totalReach = posts.reduce((sum, p) => sum + p.predictedReach, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.predictedLikes, 0);
    const avgEngagement = totalReach > 0 ? ((totalLikes / totalReach) * 100).toFixed(1) : 0;

    const campaign = await Campaign.create({
      user: req.user._id,
      campaignName, niche, brandName, brandDescription,
      toneOfVoice, goals: goals || [],
      targetPlatforms, duration: duration || 30,
      customInstructions: customInstructions || '',
      startDate: startDate || new Date(),
      posts,
      stats: {
        totalPredictedReach: totalReach,
        avgEngagementRate: parseFloat(avgEngagement),
        totalPosts: posts.length,
        approvedPosts: 0,
      },
      status: 'active',
    });

    res.status(201).json({
      message: 'Campaign created successfully!',
      campaign,
    });
  } catch (err) {
    console.error('Create campaign error:', err);
    res.status(500).json({ message: 'Error creating campaign.' });
  }
});

// ─── GET /api/campaigns ───────────────────────────────────────────
// Get all campaigns for current user
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id })
      .select('-posts')   // Don't send all posts in list view (heavy)
      .sort({ createdAt: -1 });

    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching campaigns.' });
  }
});

// ─── GET /api/campaigns/:id ───────────────────────────────────────
// Get a single campaign with full calendar (Module 3: Dashboard)
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching campaign.' });
  }
});

// ─── PUT /api/campaigns/:id/posts/:postId ─────────────────────────
// Update a single post status (approve/reject) — Module 3
router.put('/:id/posts/:postId', async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const post = campaign.posts.id(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Update allowed fields
    const { status, caption, hashtags } = req.body;
    if (status) post.status = status;
    if (caption) post.caption = caption;
    if (hashtags) post.hashtags = hashtags;

    // Recalculate approved posts stat
    campaign.stats.approvedPosts = campaign.posts.filter(p => p.status === 'approved').length;

    await campaign.save();
    res.json({ message: 'Post updated!', post });
  } catch (err) {
    res.status(500).json({ message: 'Error updating post.' });
  }
});

// ─── DELETE /api/campaigns/:id ────────────────────────────────────
// Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    res.json({ message: 'Campaign deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting campaign.' });
  }
});

module.exports = router;
