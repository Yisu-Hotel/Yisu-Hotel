const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RoomService = sequelize.define('RoomService', {
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
  service_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'services',
      key: 'id',
      onDelete: 'CASCADE'
    },
    primaryKey: true
  }
}, {
  tableName: 'room_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['room_type_id'] },
    { fields: ['service_id'] }
  ]
});

module.exports = RoomService;
