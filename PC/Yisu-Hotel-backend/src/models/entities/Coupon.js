const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discount_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['fixed', 'percentage']]
    }
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valid_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  used_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_new_user_only: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['valid_from'] },
    { fields: ['valid_until'] },
    { fields: ['is_new_user_only'] }
  ]
});

module.exports = Coupon;
