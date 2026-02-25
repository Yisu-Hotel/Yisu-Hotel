const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Favorite = sequelize.define('Favorite', {
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
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['hotel_id'] },
    { 
      unique: true,
      fields: ['user_id', 'hotel_id']
    }
  ]
});

module.exports = Favorite;
