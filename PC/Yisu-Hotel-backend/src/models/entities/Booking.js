const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Booking = sequelize.define('Booking', {
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
  hotel_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'room_types',
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  room_type_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  check_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  original_total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'CNY'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['pending', 'paid', 'completed', 'cancelled']]
    }
  },
  contact_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  booking_token: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  location_info: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  booked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['hotel_id'] },
    { fields: ['status'] },
    { fields: ['check_in_date'] },
    { fields: ['check_out_date'] },
    { fields: ['booking_token'] },
    { fields: ['order_number'] }
  ]
});

module.exports = Booking;
