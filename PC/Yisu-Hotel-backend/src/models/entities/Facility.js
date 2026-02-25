const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Facility = sequelize.define('Facility', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'facilities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['category'] }
  ]
});

module.exports = Facility;
