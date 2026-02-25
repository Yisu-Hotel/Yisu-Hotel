const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelService = sequelize.define('HotelService', {
  hotel_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hotels',
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
  tableName: 'hotel_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['hotel_id'] },
    { fields: ['service_id'] }
  ]
});

module.exports = HotelService;
