const { Subscription, User, Video } = require('../models');

const toggleSubscription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const subscriberId = req.user.id;

    if (channelId === subscriberId) {
      return res.status(400).json({ success: false, message: 'Cannot subscribe to yourself' });
    }

    const channel = await User.findByPk(channelId);
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });

    const existing = await Subscription.findOne({
      where: { subscriber_id: subscriberId, channel_id: channelId },
    });

    if (existing) {
      await existing.destroy();
      await channel.decrement('subscriber_count');
      return res.json({ success: true, subscribed: false, message: 'Unsubscribed' });
    } else {
      await Subscription.create({ subscriber_id: subscriberId, channel_id: channelId });
      await channel.increment('subscriber_count');
      return res.json({ success: true, subscribed: true, message: 'Subscribed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle subscription' });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const { channelId } = req.params;
    const sub = await Subscription.findOne({
      where: { subscriber_id: req.user.id, channel_id: channelId },
    });
    return res.json({ success: true, subscribed: !!sub });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to check subscription' });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({
      where: { subscriber_id: req.user.id },
      include: [{
        model: User,
        as: 'channel',
        attributes: ['id', 'username', 'avatar', 'subscriber_count'],
      }],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, subscriptions: subs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
};

const getSubscriptionFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const subs = await Subscription.findAll({
      where: { subscriber_id: req.user.id },
      attributes: ['channel_id'],
    });

    const channelIds = subs.map(s => s.channel_id);
    if (!channelIds.length) return res.json({ success: true, videos: [] });

    const { count, rows } = await Video.findAndCountAll({
      where: { user_id: channelIds, status: 'published' },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'username', 'avatar'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      videos: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch feed' });
  }
};

module.exports = { toggleSubscription, getSubscriptionStatus, getSubscriptions, getSubscriptionFeed };
