const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    defaultValue: null,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  views: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Duration in seconds',
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('processing', 'published', 'private', 'deleted'),
    defaultValue: 'published',
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: null,
    get() {
      const val = this.getDataValue('tags');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('tags', val ? JSON.stringify(val) : null);
    },
  },
}, {
  tableName: 'videos',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['title'], type: 'FULLTEXT' },
  ],
});

module.exports = Video;
