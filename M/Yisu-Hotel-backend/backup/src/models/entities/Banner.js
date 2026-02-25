const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  target_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['hotel', 'promotion', 'url']]
    }
  },
  target_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['target_type'] },
    { fields: ['sort'] },
    { fields: ['is_active'] },
    { fields: ['start_time', 'end_time'] }
  ]
});

module.exports = Banner;
