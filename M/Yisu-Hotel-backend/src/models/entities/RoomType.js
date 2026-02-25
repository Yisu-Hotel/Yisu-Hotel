const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RoomType = sequelize.define('RoomType', {
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
  room_type_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  bed_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['king', 'twin', 'queen']]
    }
  },
  area: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  room_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  room_image_base64: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'room_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['hotel_id'] },
    { fields: ['room_type_name'] },
    { 
      unique: true,
      fields: ['hotel_id', 'room_type_name']
    }
  ]
});

module.exports = RoomType;
