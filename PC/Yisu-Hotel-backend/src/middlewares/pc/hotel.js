const {
  isNonEmptyString,
  isValidDateYYYYMMDD,
  isValidStarRating,
  isValidLocationInfo,
  toDecimal2,
  isValidUuid
} = require('../../utils/validator');

/**
 * 验证酒店列表查询参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateHotelListQuery = (req, res, next) => {
  const { page, size, status } = req.query;

  let pageNumber = 1;
  let sizeNumber = 20;

  if (page !== undefined) {
    pageNumber = Number(page);
    if (!Number.isFinite(pageNumber) || pageNumber < 1 || !Number.isInteger(pageNumber)) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  if (size !== undefined) {
    sizeNumber = Number(size);
    if (!Number.isFinite(sizeNumber) || sizeNumber < 1 || !Number.isInteger(sizeNumber)) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  if (sizeNumber > 100) {
    sizeNumber = 100;
  }

  if (status && !['draft', 'pending', 'published', 'rejected'].includes(status)) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  req.pagination = {
    page: pageNumber,
    size: sizeNumber
  };

  next();
};

/**
 * 验证创建/更新酒店输入参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateCreateHotelInput = (req, res, next) => {
  const body = req.body || {};
  const isDraft = body.save_as_draft === true || body.save_as_draft === 'true' || body.save_as_draft === 1 || body.save_as_draft === '1';
  const requiredFields = [
    'hotel_name_cn',
    'hotel_name_en',
    'star_rating',
    'description',
    'phone',
    'opening_date',
    'room_prices',
    'location_info'
  ];

  if (!isDraft) {
    for (const field of requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(body, field)) {
        return res.status(400).json({
          code: 4001,
          msg: '必填项不能为空',
          data: null
        });
      }
    }
  }

  const {
    hotel_name_cn,
    hotel_name_en,
    star_rating,
    description,
    phone,
    opening_date,
    nearby_info,
    facilities,
    services,
    policies,
    room_prices,
    main_image_url,
    main_image_base64,
    tags,
    location_info
  } = body;

  if (!isDraft) {
    if (!isNonEmptyString(hotel_name_cn) || !isNonEmptyString(hotel_name_en) || !isNonEmptyString(description) || !isNonEmptyString(phone)) {
      return res.status(400).json({
        code: 4001,
        msg: '必填项不能为空',
        data: null
      });
    }

    if (!isValidStarRating(star_rating)) {
      return res.status(400).json({
        code: 4003,
        msg: '酒店星级格式不正确',
        data: null
      });
    }

    if (!isValidDateYYYYMMDD(opening_date)) {
      return res.status(400).json({
        code: 4006,
        msg: '开业时间格式不正确',
        data: null
      });
    }

    if (!isValidLocationInfo(location_info)) {
      return res.status(400).json({
        code: 4007,
        msg: '地址格式不正确',
        data: null
      });
    }

    if (room_prices === null || typeof room_prices !== 'object' || Array.isArray(room_prices)) {
      return res.status(400).json({
        code: 4004,
        msg: '房型格式不正确',
        data: null
      });
    }
  }

  let normalizedRoomTypes = [];
  if (!isDraft) {
    for (const [roomTypeName, roomData] of Object.entries(room_prices)) {
      if (!isNonEmptyString(roomTypeName)) {
        return res.status(400).json({
          code: 4004,
          msg: '房型格式不正确',
          data: null
        });
      }
      if (!roomData || typeof roomData !== 'object') {
        return res.status(400).json({
          code: 4004,
          msg: '房型格式不正确',
          data: null
        });
      }
      const { bed_type, area, description: roomDesc, facilities: roomFacilities, services: roomServices, room_image_url, room_image_base64, policies: roomPolicies, tags: roomTags, prices } = roomData;
      const areaNumber = Number(area);
      if (!['king', 'twin', 'queen'].includes(bed_type) || !Number.isInteger(areaNumber) || areaNumber <= 0 || !isNonEmptyString(roomDesc)) {
        return res.status(400).json({
          code: 4004,
          msg: '房型格式不正确',
          data: null
        });
      }
      if (!prices || typeof prices !== 'object' || Array.isArray(prices) || Object.keys(prices).length === 0) {
        return res.status(400).json({
          code: 4005,
          msg: '价格格式不正确',
          data: null
        });
      }
      const normalizedPrices = [];
      for (const [dateStr, priceVal] of Object.entries(prices)) {
        if (!isValidDateYYYYMMDD(dateStr)) {
          return res.status(400).json({
            code: 4005,
            msg: '价格格式不正确',
            data: null
          });
        }
        if (typeof priceVal !== 'number' || !Number.isFinite(priceVal) || priceVal < 0) {
          return res.status(400).json({
            code: 4005,
            msg: '价格格式不正确',
            data: null
          });
        }
        normalizedPrices.push({ price_date: dateStr, price: toDecimal2(priceVal) });
      }

      const normalizeRoomItems = (arr) => {
        if (!arr) return [];
        if (!Array.isArray(arr)) {
          return null;
        }
        for (const item of arr) {
          if (!item || typeof item !== 'object' || !isNonEmptyString(item.id) || !isNonEmptyString(item.name)) {
            return null;
          }
        }
        return arr.map((item) => ({
          id: String(item.id).trim(),
          name: String(item.name).trim()
        }));
      };

      const normalizedRoomFacilities = normalizeRoomItems(roomFacilities);
      if (normalizedRoomFacilities === null) {
        return res.status(400).json({
          code: 4004,
          msg: '房型格式不正确',
          data: null
        });
      }
      const normalizedRoomServices = normalizeRoomItems(roomServices);
      if (normalizedRoomServices === null) {
        return res.status(400).json({
          code: 4004,
          msg: '房型格式不正确',
          data: null
        });
      }
      const normalizedRoomTags = Array.isArray(roomTags) ? roomTags.filter((t) => isNonEmptyString(t)).map((t) => String(t).trim()) : [];

      if (roomPolicies && (typeof roomPolicies !== 'object' || Array.isArray(roomPolicies))) {
        return res.status(400).json({
          code: 4004,
          msg: '房型格式不正确',
          data: null
        });
      }
      const normalizedRoomPolicy = roomPolicies && typeof roomPolicies === 'object' ? {
        cancellation_policy: roomPolicies.cancellation || null,
        payment_policy: roomPolicies.payment || null,
        children_policy: roomPolicies.children || null,
        pets_policy: roomPolicies.pets || null
      } : null;

      normalizedRoomTypes.push({
        room_type_name: String(roomTypeName).trim(),
        bed_type,
        area: areaNumber,
        description: roomDesc || null,
        room_image_url: room_image_url || null,
        room_image_base64: isNonEmptyString(room_image_base64) ? String(room_image_base64).trim() : null,
        facilities: normalizedRoomFacilities,
        services: normalizedRoomServices,
        tags: normalizedRoomTags,
        policy: normalizedRoomPolicy,
        prices: normalizedPrices
      });
    }
  } else {
    const roomPrices = room_prices && typeof room_prices === 'object' && !Array.isArray(room_prices) ? room_prices : {};
    const normalizeRoomItems = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((item) => item && typeof item === 'object' && isNonEmptyString(item.id) && isNonEmptyString(item.name))
        .map((item) => ({ id: String(item.id).trim(), name: String(item.name).trim() }));
    };
    for (const [roomTypeName, roomData] of Object.entries(roomPrices)) {
      const data = roomData && typeof roomData === 'object' ? roomData : {};
      const areaNumber = Number(data.area);
      if (!isNonEmptyString(roomTypeName) || !['king', 'twin', 'queen'].includes(data.bed_type) || !Number.isInteger(areaNumber) || areaNumber <= 0) {
        continue;
      }
      const prices = data.prices && typeof data.prices === 'object' && !Array.isArray(data.prices) ? data.prices : {};
      const normalizedPrices = Object.entries(prices)
        .filter(([dateStr, priceVal]) => isValidDateYYYYMMDD(dateStr) && typeof priceVal === 'number' && Number.isFinite(priceVal) && priceVal >= 0)
        .map(([dateStr, priceVal]) => ({ price_date: dateStr, price: toDecimal2(priceVal) }));
      const roomPolicies = data.policies && typeof data.policies === 'object' && !Array.isArray(data.policies) ? data.policies : null;
      const normalizedRoomPolicy = roomPolicies ? {
        cancellation_policy: roomPolicies.cancellation || null,
        payment_policy: roomPolicies.payment || null,
        children_policy: roomPolicies.children || null,
        pets_policy: roomPolicies.pets || null
      } : null;
      normalizedRoomTypes.push({
        room_type_name: String(roomTypeName).trim(),
        bed_type: data.bed_type,
        area: areaNumber,
        description: isNonEmptyString(data.description) ? String(data.description).trim() : null,
        room_image_url: isNonEmptyString(data.room_image_url) ? String(data.room_image_url).trim() : null,
        room_image_base64: isNonEmptyString(data.room_image_base64) ? String(data.room_image_base64).trim() : null,
        facilities: normalizeRoomItems(data.facilities),
        services: normalizeRoomItems(data.services),
        tags: Array.isArray(data.tags) ? data.tags.filter((t) => isNonEmptyString(t)).map((t) => String(t).trim()) : [],
        policy: normalizedRoomPolicy,
        prices: normalizedPrices
      });
    }
  }

  const normalizeHotelItems = (arr) => {
    if (!arr) return [];
    if (!Array.isArray(arr)) {
      return null;
    }
    for (const item of arr) {
      if (!item || typeof item !== 'object' || !isNonEmptyString(item.id) || !isNonEmptyString(item.name)) {
        return null;
      }
    }
    return arr.map((item) => ({
      id: String(item.id).trim(),
      name: String(item.name).trim()
    }));
  };

  const normalizedFacilities = normalizeHotelItems(facilities);
  if (!isDraft && normalizedFacilities === null) {
    return res.status(400).json({
      code: 4001,
      msg: '必填项不能为空',
      data: null
    });
  }
  const normalizedServices = normalizeHotelItems(services);
  if (!isDraft && normalizedServices === null) {
    return res.status(400).json({
      code: 4001,
      msg: '必填项不能为空',
      data: null
    });
  }
  const normalizedTags = Array.isArray(tags) ? tags.filter((t) => isNonEmptyString(t)).map((t) => String(t).trim()) : [];
  const normalizedMainImageUrl = Array.isArray(main_image_url) ? main_image_url.filter((u) => isNonEmptyString(u)).map((u) => String(u).trim()) : [];
  const normalizedMainImageBase64 = Array.isArray(main_image_base64)
    ? main_image_base64.filter((b) => isNonEmptyString(b)).map((b) => String(b).trim())
    : (isNonEmptyString(main_image_base64) ? [String(main_image_base64).trim()] : []);

  if (!isDraft && policies && (typeof policies !== 'object' || Array.isArray(policies))) {
    return res.status(400).json({
      code: 4001,
      msg: '必填项不能为空',
      data: null
    });
  }
  const normalizedPolicy = policies && typeof policies === 'object' ? {
    cancellation_policy: policies.cancellation || null,
    payment_policy: policies.payment || null,
    children_policy: policies.children || null,
    pets_policy: policies.pets || null
  } : null;

  const normalizedLocation = !isDraft ? location_info : (location_info && typeof location_info === 'object' && !Array.isArray(location_info) ? {
    formatted_address: isNonEmptyString(location_info.formatted_address) ? String(location_info.formatted_address).trim() : '',
    country: isNonEmptyString(location_info.country) ? String(location_info.country).trim() : '',
    province: isNonEmptyString(location_info.province) ? String(location_info.province).trim() : '',
    city: isNonEmptyString(location_info.city) ? String(location_info.city).trim() : '',
    district: isNonEmptyString(location_info.district) ? String(location_info.district).trim() : '',
    street: isNonEmptyString(location_info.street) ? String(location_info.street).trim() : '',
    number: isNonEmptyString(location_info.number) ? String(location_info.number).trim() : '',
    location: isNonEmptyString(location_info.location) ? String(location_info.location).trim() : ''
  } : null);
  const normalizedStarRating = isDraft ? (isValidStarRating(star_rating) ? Number(star_rating) : 1) : Number(star_rating);
  const normalizedOpeningDate = isDraft ? (isValidDateYYYYMMDD(opening_date) ? opening_date : new Date().toISOString().split('T')[0]) : opening_date;

  req.hotelPayload = {
    hotel_name_cn: isNonEmptyString(hotel_name_cn) ? String(hotel_name_cn).trim() : '',
    hotel_name_en: isNonEmptyString(hotel_name_en) ? String(hotel_name_en).trim() : '',
    star_rating: normalizedStarRating,
    description: isNonEmptyString(description) ? String(description).trim() : '',
    phone: isNonEmptyString(phone) ? String(phone).trim() : '',
    opening_date: normalizedOpeningDate,
    nearby_info: nearby_info || null,
    facilities: normalizedFacilities || [],
    services: normalizedServices || [],
    policy: normalizedPolicy,
    room_types: normalizedRoomTypes,
    main_image_url: normalizedMainImageUrl,
    main_image_base64: normalizedMainImageBase64,
    tags: normalizedTags,
    location_info: normalizedLocation,
    isDraft
  };

  next();
};

/**
 * 验证酒店详情参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateHotelDetailParam = (req, res, next) => {
  const { id } = req.params;
  const hotelId = isNonEmptyString(id) ? String(id).trim() : '';

  if (!hotelId || !isValidUuid(hotelId)) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  req.hotelId = hotelId;
  next();
};

/**
 * 验证酒店审核状态查询参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateAuditStatusParam = (req, res, next) => {
  const { id } = req.params;
  const hotelId = isNonEmptyString(id) ? String(id).trim() : '';

  if (!hotelId || !isValidUuid(hotelId)) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  req.hotelId = hotelId;
  next();
};

/**
 * 验证酒店删除参数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Promise<void>} - 无返回值
 */
const validateHotelDeleteParam = (req, res, next) => {
  const { id } = req.params;
  const hotelId = isNonEmptyString(id) ? String(id).trim() : '';

  if (!hotelId || !isValidUuid(hotelId)) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  req.hotelId = hotelId;
  next();
};

module.exports = {
  validateHotelListQuery,
  validateCreateHotelInput,
  validateHotelDetailParam,
  validateAuditStatusParam,
  validateHotelDeleteParam
};
