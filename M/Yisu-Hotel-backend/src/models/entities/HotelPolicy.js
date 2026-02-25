const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelPolicy = sequelize.define('HotelPolicy', {
  hotel_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'hotels',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  cancellation_policy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payment_policy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  children_policy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pets_policy: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hotel_policies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HotelPolicy;
