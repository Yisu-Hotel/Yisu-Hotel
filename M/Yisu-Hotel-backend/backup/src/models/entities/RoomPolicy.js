const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RoomPolicy = sequelize.define('RoomPolicy', {
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'room_types',
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
  tableName: 'room_policies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RoomPolicy;
