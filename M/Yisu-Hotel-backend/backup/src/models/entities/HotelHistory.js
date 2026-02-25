const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelHistory = sequelize.define('HotelHistory', {
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
      key: 'id'
    }
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  modified_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  modified_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  changes: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  tableName: 'hotel_history',
  timestamps: false,
  indexes: [
    { fields: ['hotel_id'] },
    { fields: ['version'] },
    { fields: ['modified_at'] }
  ]
});

module.exports = HotelHistory;
