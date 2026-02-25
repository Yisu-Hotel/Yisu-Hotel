const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hotel_name_cn: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  hotel_name_en: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  star_rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  review_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  opening_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nearby_info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  main_image_url: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  main_image_base64: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  location_info: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['draft', 'pending', 'auditing', 'approved', 'rejected', 'published', 'offline']]
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'hotels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['created_by'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['status', 'created_at'] },
    { 
      type: 'FULLTEXT',
      fields: ['hotel_name_cn']
    }
  ]
});

module.exports = Hotel;
