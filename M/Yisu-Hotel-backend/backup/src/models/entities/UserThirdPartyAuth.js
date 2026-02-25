const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const UserThirdPartyAuth = sequelize.define('UserThirdPartyAuth', {
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
  provider: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['wechat', 'alipay']]
    }
  },
  open_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'user_third_party_auth',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['provider'] },
    { fields: ['open_id'] },
    { 
      unique: true,
      fields: ['provider', 'open_id']
    }
  ]
});

module.exports = UserThirdPartyAuth;
