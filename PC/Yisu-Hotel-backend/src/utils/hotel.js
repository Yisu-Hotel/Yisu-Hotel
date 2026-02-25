const { Op, literal, where } = require('sequelize');

/**
 * 构建酒店列表查询条件
 * @param {Object} params - 查询参数
 * @param {number} [params.userId] - 创建者ID
 * @param {string} [params.status] - 酒店状态
 * @param {string} [params.keyword] - 搜索关键字
 * @returns {Object} - Sequelize where 查询对象
 */
const buildHotelListWhere = ({ userId, status, keyword }) => {
  const whereClause = { created_by: userId };

  if (status) {
    whereClause.status = status;
  }

  if (keyword) {
    const likeKeyword = `%${keyword}%`;
    whereClause[Op.or] = [
      { hotel_name_cn: { [Op.iLike]: likeKeyword } },
      { hotel_name_en: { [Op.iLike]: likeKeyword } },
      where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: likeKeyword })
    ];
  }

  return whereClause;
};

/**
 * 构建管理员酒店筛选查询条件
 * @param {Object} params - 筛选参数
 * @param {string} [params.status] - 酒店状态
 * @param {string} [params.keyword] - 搜索关键字
 * @param {string} [params.startDate] - 开始日期
 * @param {string} [params.endDate] - 结束日期
 * @returns {Object} - Sequelize where 查询对象
 */
const buildAdminHotelFilterWhere = ({ status, keyword, startDate, endDate }) => {
  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (startDate || endDate) {
    whereClause.created_at = {};
    if (startDate) {
      whereClause.created_at[Op.gte] = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      whereClause.created_at[Op.lte] = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  if (keyword) {
    const likeKeyword = `%${keyword}%`;
    whereClause[Op.or] = [
      { hotel_name_cn: { [Op.iLike]: likeKeyword } },
      { hotel_name_en: { [Op.iLike]: likeKeyword } },
      where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: likeKeyword }),
      where(literal(`"Hotel"."location_info"->>'city'`), { [Op.iLike]: likeKeyword }),
      where(literal(`"Hotel"."location_info"->>'district'`), { [Op.iLike]: likeKeyword }),
      where(literal(`"Hotel"."location_info"->>'street'`), { [Op.iLike]: likeKeyword })
    ];
  }

  return whereClause;
};

/**
 * 酒店列表查询属性配置
 * @type {Array<string|Array>}
 */
const hotelListAttributes = [
  'id',
  'hotel_name_cn',
  'hotel_name_en',
  'star_rating',
  'description',
  'phone',
  'opening_date',
  'nearby_info',
  'main_image_url',
  'main_image_base64',
  'tags',
  'location_info',
  'status',
  'created_at',
  'updated_at',
  [
    literal('COALESCE((SELECT COUNT(*) FROM "favorites" WHERE "favorites"."hotel_id" = "Hotel"."id"), 0)'),
    'favorite_count'
  ],
  [
    literal('COALESCE(ROUND((SELECT AVG("rating") FROM "hotel_reviews" WHERE "hotel_reviews"."hotel_id" = "Hotel"."id"), 1), 0)'),
    'average_rating'
  ],
  [
    literal('COALESCE((SELECT COUNT(*) FROM "bookings" WHERE "bookings"."hotel_id" = "Hotel"."id"), 0)'),
    'booking_count'
  ],
  [
    literal('COALESCE((SELECT COUNT(*) FROM "hotel_reviews" WHERE "hotel_reviews"."hotel_id" = "Hotel"."id"), 0)'),
    'review_count'
  ]
];

/**
 * 格式化酒店列表数据
 * @param {Array<Object>} hotels - 原始酒店数据数组
 * @returns {Array<Object>} - 格式化后的酒店数据数组
 */
const formatHotelList = (hotels) => hotels.map((hotel) => ({
  hotel_id: hotel.id,
  hotel_name_cn: hotel.hotel_name_cn,
  hotel_name_en: hotel.hotel_name_en,
  star_rating: hotel.star_rating,
  description: hotel.description,
  phone: hotel.phone,
  opening_date: hotel.opening_date,
  nearby_info: hotel.nearby_info,
  main_image_url: hotel.main_image_url,
  main_image_base64: hotel.main_image_base64,
  tags: hotel.tags,
  location_info: hotel.location_info,
  status: hotel.status,
  favorite_count: Number(hotel.favorite_count) || 0,
  average_rating: Number(hotel.average_rating) || 0,
  booking_count: Number(hotel.booking_count) || 0,
  review_count: Number(hotel.review_count) || 0,
  created_at: hotel.created_at,
  updated_at: hotel.updated_at
}));

/**
 * 获取审核状态文本
 * @param {string} status - 审核状态
 * @returns {string} - 状态文本描述
 */
const getAuditStatusText = (status) => {
  if (status === 'draft') return '草稿';
  if (status === 'pending') return '待审核';
  if (status === 'auditing') return '审核中';
  if (status === 'approved') return '已通过';
  if (status === 'rejected') return '已拒绝';
  if (status === 'published') return '已发布';
  if (status === 'offline') return '已下线';
  return '';
};

/**
 * 获取审核员姓名
 * @param {Object} auditor - 审核员对象
 * @returns {string|null} - 审核员姓名或ID
 */
const getAuditorName = (auditor) => {
  if (!auditor) return null;
  if (auditor.profile && auditor.profile.nickname) return auditor.profile.nickname;
  if (auditor.nickname) return auditor.nickname;
  if (auditor.phone) return auditor.phone;
  return auditor.id || null;
};

/**
 * 格式化审核日志
 * @param {Array<Object>} logs - 审核日志数组
 * @returns {Array<Object>} - 格式化后的日志数组
 */
const formatAuditLogs = (logs) => (logs || []).map((log) => {
  const status = log.result || log.status || '';
  const auditedBy = getAuditorName(log.auditor) || log.auditor_id || null;
  const item = {
    hotel_id: log.hotel_id,
    status,
    status_text: getAuditStatusText(status),
    submitted_at: log.created_at || null
  };
  if (log.audited_at) item.audited_at = log.audited_at;
  if (auditedBy) item.audited_by = auditedBy;
  if (log.reject_reason) item.reject_reason = log.reject_reason;
  return item;
});

module.exports = {
  buildHotelListWhere,
  buildAdminHotelFilterWhere,
  hotelListAttributes,
  formatHotelList,
  getAuditStatusText,
  getAuditorName,
  formatAuditLogs
};
