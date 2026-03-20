// routes/comments.js
const express = require('express');
const commentRouter = express.Router();
const { authenticate } = require('../middleware/auth');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');

commentRouter.get('/:videoId', getComments);
commentRouter.post('/:videoId', authenticate, createComment);
commentRouter.delete('/:id', authenticate, deleteComment);

// routes/subscriptions.js
const subRouter = express.Router();
const { toggleSubscription, getSubscriptionStatus, getSubscriptions, getSubscriptionFeed } = require('../controllers/subscriptionController');

subRouter.get('/', authenticate, getSubscriptions);
subRouter.get('/feed', authenticate, getSubscriptionFeed);
subRouter.get('/status/:channelId', authenticate, getSubscriptionStatus);
subRouter.post('/:channelId', authenticate, toggleSubscription);

module.exports = { commentRouter, subRouter };
