const { Op } = require('sequelize');
const { Video, User, Like } = require('../models');
const fs = require('fs');
const path = require('path');

const getVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'latest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const orderMap = {
      latest: [['created_at', 'DESC']],
      popular: [['views', 'DESC']],
      trending: [['likes_count', 'DESC']],
    };

    const { count, rows } = await Video.findAndCountAll({
      where: { status: 'published' },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username', 'avatar', 'subscriber_count'],
      }],
      order: orderMap[sort] || orderMap.latest,
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      videos: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getVideos error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch videos' });
  }
};

const getVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id, {
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username', 'avatar', 'bio', 'subscriber_count'],
      }],
    });

    if (!video || video.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Increment views
    await video.increment('views');

    // Check if current user liked
    let userLike = null;
    if (req.user) {
      userLike = await Like.findOne({ where: { user_id: req.user.id, video_id: id } });
    }

    // Suggested videos
    const suggested = await Video.findAll({
      where: { status: 'published', id: { [Op.ne]: id } },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'username', 'avatar'] }],
      order: [['views', 'DESC']],
      limit: 10,
    });

    return res.json({
      success: true,
      video: { ...video.toJSON(), userLike: userLike?.type || null },
      suggested,
    });
  } catch (error) {
    console.error('getVideo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch video' });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!req.files?.video) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    const videoData = {
      title: title.trim(),
      description: description?.trim() || '',
      video_url: `/uploads/videos/${videoFile.filename}`,
      thumbnail_url: thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null,
      user_id: req.user.id,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    };

    const video = await Video.create(videoData);

    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      video,
    });
  } catch (error) {
    console.error('uploadVideo error:', error);
    return res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);

    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (video.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { title, description, tags, status } = req.body;
    const updates = {};

    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (tags) updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (status) updates.status = status;

    if (req.files?.thumbnail?.[0]) {
      // Delete old thumbnail
      if (video.thumbnail_url) {
        const oldPath = path.join(__dirname, '..', video.thumbnail_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.thumbnail_url = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    await video.update(updates);
    return res.json({ success: true, message: 'Video updated', video });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);

    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (video.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Delete files
    const videoPath = path.join(__dirname, '..', video.video_url);
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

    if (video.thumbnail_url) {
      const thumbPath = path.join(__dirname, '..', video.thumbnail_url);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await video.destroy();
    return res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

const searchVideos = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.json({ success: true, videos: [], pagination: {} });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${q}%`;

    const { count, rows } = await Video.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.like]: searchTerm } },
          { description: { [Op.like]: searchTerm } },
        ],
      },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username', 'avatar'],
        where: {
          [Op.or]: [
            {},
            { username: { [Op.like]: searchTerm } },
          ],
        },
        required: false,
      }],
      order: [['views', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      videos: rows,
      query: q,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('searchVideos error:', error);
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { user_id: userId };
    if (userId !== req.user?.id) whereClause.status = 'published';

    const { count, rows } = await Video.findAndCountAll({
      where: whereClause,
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
    return res.status(500).json({ success: false, message: 'Failed to fetch user videos' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id: videoId } = req.params;
    const { type = 'like' } = req.body;

    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const existing = await Like.findOne({ where: { user_id: req.user.id, video_id: videoId } });

    if (existing) {
      if (existing.type === type) {
        // Remove like
        await existing.destroy();
        await video.decrement('likes_count');
        return res.json({ success: true, action: 'removed', type: null });
      } else {
        // Change like type
        await existing.update({ type });
        return res.json({ success: true, action: 'changed', type });
      }
    } else {
      await Like.create({ user_id: req.user.id, video_id: videoId, type });
      if (type === 'like') await video.increment('likes_count');
      return res.json({ success: true, action: 'added', type });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
};

module.exports = { getVideos, getVideo, uploadVideo, updateVideo, deleteVideo, searchVideos, getUserVideos, toggleLike };
