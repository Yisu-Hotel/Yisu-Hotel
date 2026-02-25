const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const History = sequelize.define('History', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
      onDelete: 'CASCADE'
    }
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
  viewed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'histories',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['hotel_id'] },
    { fields: ['viewed_at'] }
  ]
});

module.exports = History;
