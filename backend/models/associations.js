const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  video_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'videos', key: 'id' },
  },
  comment_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true, len: [1, 2000] },
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'comments',
  indexes: [{ fields: ['video_id'] }, { fields: ['user_id'] }],
});

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  video_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'videos', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('like', 'dislike'),
    defaultValue: 'like',
  },
}, {
  tableName: 'likes',
  indexes: [
    { unique: true, fields: ['user_id', 'video_id'] },
    { fields: ['video_id'] },
  ],
});

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  subscriber_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  channel_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'subscriptions',
  indexes: [
    { unique: true, fields: ['subscriber_id', 'channel_id'] },
    { fields: ['channel_id'] },
  ],
});

module.exports = { Comment, Like, Subscription };
