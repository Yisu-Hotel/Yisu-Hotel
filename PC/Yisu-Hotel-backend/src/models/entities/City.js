const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const City = sequelize.define('City', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  city_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'cities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { 
      type: 'FULLTEXT',
      fields: ['city_name']
    },
    { fields: ['province'] },
    { fields: ['sort'] }
  ]
});

module.exports = City;
