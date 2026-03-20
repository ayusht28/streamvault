const { Comment, User, Video } = require('../models');

const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Comment.findAndCountAll({
      where: { video_id: videoId },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar'],
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      comments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

const createComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { comment_text } = req.body;

    if (!comment_text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const comment = await Comment.create({
      user_id: req.user.id,
      video_id: videoId,
      comment_text: comment_text.trim(),
    });

    await video.increment('comments_count');

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
    });

    return res.status(201).json({ success: true, comment: fullComment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);

    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const video = await Video.findByPk(comment.video_id);
    await comment.destroy();
    if (video) await video.decrement('comments_count');

    return res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

module.exports = { getComments, createComment, deleteComment };
