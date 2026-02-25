const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RoomPrice = sequelize.define('RoomPrice', {
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
  price_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'room_prices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['room_type_id'] },
    { fields: ['price_date'] },
    { 
      unique: true,
      fields: ['room_type_id', 'price_date']
    }
  ]
});

module.exports = RoomPrice;
