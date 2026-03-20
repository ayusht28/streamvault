const sequelize = require('../config/database');
const User = require('./User');
const Video = require('./Video');
const { Comment, Like, Subscription } = require('./associations');

// User -> Videos
User.hasMany(Video, { foreignKey: 'user_id', as: 'videos', onDelete: 'CASCADE' });
Video.belongsTo(User, { foreignKey: 'user_id', as: 'uploader' });

// Video -> Comments
Video.hasMany(Comment, { foreignKey: 'video_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

// User -> Comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Video -> Likes
Video.hasMany(Like, { foreignKey: 'video_id', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

// User -> Likes
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Subscriptions
User.hasMany(Subscription, { foreignKey: 'subscriber_id', as: 'subscriptions', onDelete: 'CASCADE' });
User.hasMany(Subscription, { foreignKey: 'channel_id', as: 'subscribers', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'subscriber_id', as: 'subscriber' });
Subscription.belongsTo(User, { foreignKey: 'channel_id', as: 'channel' });

module.exports = { sequelize, User, Video, Comment, Like, Subscription };
