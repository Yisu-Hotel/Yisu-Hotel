const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AuditLog = sequelize.define('AuditLog', {
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
  auditor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  audited_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  result: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['approved', 'rejected']]
    }
  },
  reject_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['hotel_id'] },
    { fields: ['audited_at'] },
    { fields: ['auditor_id'] }
  ]
});

module.exports = AuditLog;
