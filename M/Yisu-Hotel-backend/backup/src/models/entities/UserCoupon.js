const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const UserCoupon = sequelize.define('UserCoupon', {
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
  coupon_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id',
      onDelete: 'SET NULL'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['available', 'used', 'expired']]
    }
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['coupon_id'] },
    { fields: ['status'] },
    { fields: ['booking_id'] }
  ]
});

module.exports = UserCoupon;
