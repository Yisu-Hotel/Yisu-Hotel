const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RoomFacility = sequelize.define('RoomFacility', {
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'room_types',
      key: 'id',
      onDelete: 'CASCADE'
    },
    primaryKey: true
  },
  facility_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'facilities',
      key: 'id',
      onDelete: 'CASCADE'
    },
    primaryKey: true
  }
}, {
  tableName: 'room_facilities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['room_type_id'] },
    { fields: ['facility_id'] }
  ]
});

module.exports = RoomFacility;
