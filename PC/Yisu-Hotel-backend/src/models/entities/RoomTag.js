const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RoomTag = sequelize.define('RoomTag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'room_types',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  tag_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'room_tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['room_type_id'] },
    { fields: ['tag_name'] }
  ]
});

module.exports = RoomTag;
