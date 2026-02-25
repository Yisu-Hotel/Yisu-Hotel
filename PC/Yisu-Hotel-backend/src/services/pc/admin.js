const { sequelize, Hotel, AuditLog, Message } = require('../../models');
const { buildAdminHotelFilterWhere, getAuditStatusText } = require('../../utils/hotel');
const { getHotelDetailByAdminService: getAdminHotelDetailService } = require('./hotel');

const adminHotelAttributes = [
  'id',
  'hotel_name_cn',
  'hotel_name_en',
  'location_info',
  'status',
  'created_at',
  'created_by'
];

/**
 * 获取管理员酒店审核列表服务
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 审核状态
 * @param {string} [params.startDate] - 开始日期
 * @param {string} [params.endDate] - 结束日期
 * @param {string} [params.keyword] - 搜索关键字
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<Object>} - 列表数据
 */
const getAdminHotelAuditListService = async ({ status, startDate, endDate, keyword, page, pageSize }) => {
  const whereClause = buildAdminHotelFilterWhere({ status, startDate, endDate, keyword });

  const total = await Hotel.count({ where: whereClause });

  const hotels = await Hotel.findAll({
    where: whereClause,
    attributes: adminHotelAttributes,
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    raw: true
  });

  const hotelIds = hotels.map((item) => item.id);
  const auditMap = new Map();
  if (hotelIds.length) {
    const logs = await AuditLog.findAll({
      where: { hotel_id: hotelIds },
      order: [['audited_at', 'DESC']],
      raw: true
    });
    for (const log of logs) {
      if (!auditMap.has(log.hotel_id)) {
        auditMap.set(log.hotel_id, log);
      }
    }
  }

  const list = hotels.map((hotel) => {
    const log = auditMap.get(hotel.id);
    const item = {
      hotel_id: hotel.id,
      hotel_name_cn: hotel.hotel_name_cn,
      hotel_name_en: hotel.hotel_name_en,
      submitted_at: hotel.created_at,
      submitted_by: hotel.created_by,
      status: hotel.status,
      status_text: getAuditStatusText(hotel.status),
      location_info: hotel.location_info || null
    };
    if (log) {
      if (log.audited_at) {
        item.audited_at = log.audited_at;
      }
      if (log.auditor_id) {
        item.audited_by = log.auditor_id;
      }
      if (log.reject_reason) {
        item.reject_reason = log.reject_reason;
      }
    }
    return item;
  });

  return {
    total,
    page,
    page_size: pageSize,
    list
  };
};

/**
 * 批量审核酒店服务
 * @param {Object} params - 审核参数
 * @param {number[]} params.hotelIds - 酒店ID列表
 * @param {string} params.status - 审核状态
 * @param {number} params.auditorId - 审核人ID
 * @param {string} [params.rejectReason] - 拒绝原因
 * @returns {Promise<Object>} - 审核结果
 */
const batchAuditHotelsService = async ({ hotelIds, status, auditorId, rejectReason }) => {
  const transaction = await sequelize.transaction();
  try {
    const hotels = await Hotel.findAll({
      where: { id: hotelIds },
      attributes: ['id', 'hotel_name_cn', 'created_by'],
      transaction,
      raw: true
    });

    if (hotels.length !== hotelIds.length) {
      const error = new Error('酒店不存在');
      error.httpStatus = 404;
      error.code = 4010;
      throw error;
    }

    await Hotel.update(
      { status },
      {
        where: { id: hotelIds },
        transaction
      }
    );

    const now = new Date();
    const logs = hotelIds.map((hotelId) => ({
      hotel_id: hotelId,
      auditor_id: auditorId,
      audited_at: now,
      result: status,
      reject_reason: status === 'rejected' ? rejectReason : null
    }));

    await AuditLog.bulkCreate(logs, { transaction });

    const messages = hotels.map((hotel) => {
      const content = {
        hotel_id: hotel.id,
        hotel_name: hotel.hotel_name_cn,
        status
      };
      if (status === 'rejected') {
        content.reject_reason = rejectReason;
      }
      return {
        user_id: hotel.created_by,
        sender: 'admin',
        status: '未读',
        content
      };
    });

    await Message.bulkCreate(messages, { transaction });

    await transaction.commit();

    return {
      updated: hotelIds.length,
      hotel_ids: hotelIds,
      status
    };
  } catch (error) {
    if (!transaction.finished || transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    throw error;
  }
};

module.exports = {
  getAdminHotelAuditListService,
  getAdminHotelDetailService,
  batchAuditHotelsService
};
