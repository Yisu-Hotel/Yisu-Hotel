const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const UserProfile = sequelize.define('UserProfile', {
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      isIn: [['男', '女', '保密']]
    }
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  avatar_base64: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['nickname'] }
  ]
});

module.exports = UserProfile;
