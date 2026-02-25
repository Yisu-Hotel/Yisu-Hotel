/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} - 是否有效
 */
const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证非空字符串
 * @param {*} value - 待验证值
 * @returns {boolean} - 是否为非空字符串
 */
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * 验证 YYYY-MM-DD 日期格式
 * @param {string} value - 日期字符串
 * @returns {boolean} - 是否有效
 */
const isValidDateYYYYMMDD = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsedDate = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsedDate.getTime());
};

/**
 * 验证星级评分 (1-5)
 * @param {number|string} value - 评分值
 * @returns {boolean} - 是否有效
 */
const isValidStarRating = (value) => {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

/**
 * 验证位置信息对象
 * @param {Object} value - 位置信息对象
 * @returns {boolean} - 是否有效
 */
const isValidLocationInfo = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const fields = ['formatted_address', 'country', 'province', 'city', 'district', 'street', 'number', 'location'];
  return fields.every((field) => typeof value[field] === 'string' && value[field].trim().length > 0);
};

/**
 * 保留两位小数
 * @param {number|string} value - 数值
 * @returns {number} - 保留两位小数后的数值
 */
const toDecimal2 = (value) => {
  return Math.round(Number(value) * 100) / 100;
};

const isValidUuid = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
};

module.exports = {
  validatePhone,
  isNonEmptyString,
  isValidDateYYYYMMDD,
  isValidStarRating,
  isValidLocationInfo,
  toDecimal2,
  isValidUuid
};
