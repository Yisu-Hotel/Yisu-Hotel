const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelReview = sequelize.define('HotelReview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hotel_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hotels',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'room_types',
      key: 'id',
      onDelete: 'SET NULL'
    }
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id',
      onDelete: 'SET NULL'
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'hotel_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['hotel_id'] },
    { fields: ['user_id'] },
    { fields: ['rating'] },
    { fields: ['created_at'] },
    { 
      unique: true,
      fields: ['hotel_id', 'user_id', 'booking_id']
    }
  ]
});

module.exports = HotelReview;
