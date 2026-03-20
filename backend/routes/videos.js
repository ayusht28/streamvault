const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { uploadVideoWithThumb } = require('../middleware/upload');
const {
  getVideos, getVideo, uploadVideo, updateVideo, deleteVideo,
  searchVideos, getUserVideos, toggleLike,
} = require('../controllers/videoController');

router.get('/', getVideos);
router.get('/search', searchVideos);
router.get('/user/:userId', optionalAuth, getUserVideos);
router.get('/my', authenticate, getUserVideos);
router.get('/:id', optionalAuth, getVideo);
router.post('/upload', authenticate, uploadVideoWithThumb, uploadVideo);
router.put('/:id', authenticate, uploadVideoWithThumb, updateVideo);
router.delete('/:id', authenticate, deleteVideo);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;
