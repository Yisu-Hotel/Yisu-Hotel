const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelFacility = sequelize.define('HotelFacility', {
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
  tableName: 'hotel_facilities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['hotel_id'] },
    { fields: ['facility_id'] }
  ]
});

module.exports = HotelFacility;
