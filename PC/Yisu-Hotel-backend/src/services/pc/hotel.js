const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const {
  sequelize,
  Hotel,
  HotelPolicy,
  AuditLog,
  User,
  UserProfile,
  Facility,
  Service,
  HotelFacility,
  HotelService,
  RoomType,
  RoomFacility,
  RoomService,
  RoomPrice,
  RoomTag,
  RoomPolicy
} = require('../../models');

const ROOM_IMAGE_DIR = path.resolve(__dirname, '../../../../Yisu-Hotel-PC/public/room_image');
const ROOM_IMAGE_URL_BASE = 'http://localhost:3000/room_image';
const HOTEL_IMAGE_DIR = path.resolve(__dirname, '../../../../Yisu-Hotel-PC/public/main_image');
const HOTEL_IMAGE_URL_BASE = 'http://localhost:3000/main_image';

const ensureImageDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const parseBase64Image = (base64) => {
  const dataUrlMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(base64 || '');
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1];
    const data = dataUrlMatch[2];
    const extension = mime.split('/')[1] || 'png';
    return { buffer: Buffer.from(data, 'base64'), extension };
  }
  return { buffer: Buffer.from(base64, 'base64'), extension: 'png' };
};

const saveBase64Image = (base64, prefix, dir, urlBase) => {
  if (!base64 || typeof base64 !== 'string') {
    return null;
  }
  try {
    ensureImageDir(dir);
    const { buffer, extension } = parseBase64Image(base64);
    const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '') || 'png';
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExtension}`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);
    return `${urlBase}/${filename}`;
  } catch (error) {
    return null;
  }
};

const saveBase64Images = (images, prefix, dir, urlBase) => {
  if (!Array.isArray(images)) {
    const single = saveBase64Image(images, prefix, dir, urlBase);
    return single ? [single] : [];
  }
  return images.map((item) => saveBase64Image(item, prefix, dir, urlBase)).filter(Boolean);
};

/**
 * 创建酒店服务
 * 处理酒店及其相关信息（政策、设施、服务、房型等）的创建，使用事务确保数据一致性
 * @param {number} userId - 创建者用户ID
 * @param {Object} payload - 酒店创建数据载荷
 * @returns {Promise<Object>} - 创建结果，包含 hotel_id 和 status
 * @throws {Error} - 创建失败抛出异常
 */
const createHotelService = async (userId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    // 判断是否为草稿状态
    const isDraft = payload.isDraft === true || payload.save_as_draft === true || payload.save_as_draft === 'true' || payload.save_as_draft === 1 || payload.save_as_draft === '1';
    const status = isDraft ? 'draft' : 'pending';

    // 如果不是草稿，检查酒店名称是否已存在
    if (!isDraft) {
      const exists = await Hotel.findOne({
        where: {
          [Op.or]: [
            { hotel_name_cn: payload.hotel_name_cn },
            { hotel_name_en: payload.hotel_name_en }
          ]
        },
        transaction
      });

      if (exists) {
        const error = new Error('酒店名称已存在');
        error.httpStatus = 400;
        error.code = 4002;
        throw error;
      }
    }

    const mainImageUrls = [
      ...(Array.isArray(payload.main_image_url) ? payload.main_image_url : payload.main_image_url ? [payload.main_image_url] : []),
      ...saveBase64Images(payload.main_image_base64, 'hotel', HOTEL_IMAGE_DIR, HOTEL_IMAGE_URL_BASE)
    ].filter(Boolean);

    // 创建酒店基本信息
    const hotel = await Hotel.create({
      hotel_name_cn: payload.hotel_name_cn,
      hotel_name_en: payload.hotel_name_en,
      star_rating: payload.star_rating,
      description: payload.description,
      phone: payload.phone,
      opening_date: payload.opening_date,
      nearby_info: payload.nearby_info,
      main_image_url: mainImageUrls,
      tags: payload.tags,
      location_info: payload.location_info,
      status,
      created_by: userId
    }, { transaction });

    // 创建酒店政策
    if (payload.policy) {
      await HotelPolicy.create({
        hotel_id: hotel.id,
        cancellation_policy: payload.policy.cancellation_policy,
        payment_policy: payload.policy.payment_policy,
        children_policy: payload.policy.children_policy,
        pets_policy: payload.policy.pets_policy
      }, { transaction });
    }

    // 处理酒店设施
    for (const f of payload.facilities || []) {
      await Facility.findOrCreate({
        where: { id: f.id },
        defaults: { id: f.id, name: f.name || f.id },
        transaction
      });
      await HotelFacility.findOrCreate({
        where: { hotel_id: hotel.id, facility_id: f.id },
        defaults: { hotel_id: hotel.id, facility_id: f.id },
        transaction
      });
    }

    // 处理酒店服务
    for (const s of payload.services || []) {
      await Service.findOrCreate({
        where: { id: s.id },
        defaults: { id: s.id, name: s.name || s.id },
        transaction
      });
      await HotelService.findOrCreate({
        where: { hotel_id: hotel.id, service_id: s.id },
        defaults: { hotel_id: hotel.id, service_id: s.id },
        transaction
      });
    }

    // 处理房型信息
    for (const rt of payload.room_types || []) {
      const roomImageUrl = saveBase64Image(rt.room_image_base64, 'room', ROOM_IMAGE_DIR, ROOM_IMAGE_URL_BASE) || rt.room_image_url || null;
      const roomType = await RoomType.create({
        hotel_id: hotel.id,
        room_type_name: rt.room_type_name,
        bed_type: rt.bed_type,
        area: rt.area,
        description: rt.description,
        room_image_url: roomImageUrl
      }, { transaction });

      // 房型政策
      if (rt.policy) {
        await RoomPolicy.create({
          room_type_id: roomType.id,
          cancellation_policy: rt.policy.cancellation_policy,
          payment_policy: rt.policy.payment_policy,
          children_policy: rt.policy.children_policy,
          pets_policy: rt.policy.pets_policy
        }, { transaction });
      }

      // 房型设施
      for (const f of rt.facilities || []) {
        await Facility.findOrCreate({
          where: { id: f.id },
          defaults: { id: f.id, name: f.name || f.id },
          transaction
        });
        await RoomFacility.findOrCreate({
          where: { room_type_id: roomType.id, facility_id: f.id },
          defaults: { room_type_id: roomType.id, facility_id: f.id },
          transaction
        });
      }

      // 房型服务
      for (const s of rt.services || []) {
        await Service.findOrCreate({
          where: { id: s.id },
          defaults: { id: s.id, name: s.name || s.id },
          transaction
        });
        await RoomService.findOrCreate({
          where: { room_type_id: roomType.id, service_id: s.id },
          defaults: { room_type_id: roomType.id, service_id: s.id },
          transaction
        });
      }

      // 房型标签
      for (const tagName of rt.tags || []) {
        await RoomTag.create({
          room_type_id: roomType.id,
          tag_name: tagName
        }, { transaction });
      }

      // 房型价格
      for (const priceItem of rt.prices || []) {
        await RoomPrice.create({
          room_type_id: roomType.id,
          price_date: priceItem.price_date,
          price: priceItem.price
        }, { transaction });
      }
    }

    await transaction.commit();
    return { hotel_id: hotel.id, status };
  } catch (error) {
    if (!transaction.finished || transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * 更新酒店服务
 * @param {number} userId - 用户ID
 * @param {number} hotelId - 酒店ID
 * @param {Object} payload - 更新数据
 * @returns {Promise<Object>} - 更新结果
 */
const updateHotelService = async (userId, hotelId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    const hotel = await Hotel.findOne({
      where: { id: hotelId, created_by: userId },
      transaction
    });
    if (!hotel) {
      const error = new Error('酒店不存在');
      error.httpStatus = 404;
      error.code = 4010;
      throw error;
    }

    const isDraft = payload.isDraft === true || payload.save_as_draft === true || payload.save_as_draft === 'true' || payload.save_as_draft === 1 || payload.save_as_draft === '1';
    const status = isDraft ? 'draft' : 'pending';

    if (!isDraft) {
      const exists = await Hotel.findOne({
        where: {
          id: { [Op.ne]: hotelId },
          [Op.or]: [
            { hotel_name_cn: payload.hotel_name_cn },
            { hotel_name_en: payload.hotel_name_en }
          ]
        },
        transaction
      });
      if (exists) {
        const error = new Error('酒店名称已存在');
        error.httpStatus = 400;
        error.code = 4002;
        throw error;
      }
    }

    const mainImageUrls = [
      ...(Array.isArray(payload.main_image_url) ? payload.main_image_url : payload.main_image_url ? [payload.main_image_url] : []),
      ...saveBase64Images(payload.main_image_base64, 'hotel', HOTEL_IMAGE_DIR, HOTEL_IMAGE_URL_BASE)
    ].filter(Boolean);

    await Hotel.update({
      hotel_name_cn: payload.hotel_name_cn,
      hotel_name_en: payload.hotel_name_en,
      star_rating: payload.star_rating,
      description: payload.description,
      phone: payload.phone,
      opening_date: payload.opening_date,
      nearby_info: payload.nearby_info,
      main_image_url: mainImageUrls,
      tags: payload.tags,
      location_info: payload.location_info,
      status
    }, { where: { id: hotelId }, transaction });

    await HotelPolicy.destroy({ where: { hotel_id: hotelId }, transaction });
    if (payload.policy) {
      await HotelPolicy.create({
        hotel_id: hotelId,
        cancellation_policy: payload.policy.cancellation_policy,
        payment_policy: payload.policy.payment_policy,
        children_policy: payload.policy.children_policy,
        pets_policy: payload.policy.pets_policy
      }, { transaction });
    }

    await HotelFacility.destroy({ where: { hotel_id: hotelId }, transaction });
    for (const f of payload.facilities || []) {
      await Facility.findOrCreate({
        where: { id: f.id },
        defaults: { id: f.id, name: f.name || f.id },
        transaction
      });
      await HotelFacility.findOrCreate({
        where: { hotel_id: hotelId, facility_id: f.id },
        defaults: { hotel_id: hotelId, facility_id: f.id },
        transaction
      });
    }

    await HotelService.destroy({ where: { hotel_id: hotelId }, transaction });
    for (const s of payload.services || []) {
      await Service.findOrCreate({
        where: { id: s.id },
        defaults: { id: s.id, name: s.name || s.id },
        transaction
      });
      await HotelService.findOrCreate({
        where: { hotel_id: hotelId, service_id: s.id },
        defaults: { hotel_id: hotelId, service_id: s.id },
        transaction
      });
    }

    await RoomType.destroy({ where: { hotel_id: hotelId }, transaction });
    for (const rt of payload.room_types || []) {
      const roomImageUrl = saveBase64Image(rt.room_image_base64, 'room', ROOM_IMAGE_DIR, ROOM_IMAGE_URL_BASE) || rt.room_image_url || null;
      const roomType = await RoomType.create({
        hotel_id: hotelId,
        room_type_name: rt.room_type_name,
        bed_type: rt.bed_type,
        area: rt.area,
        description: rt.description,
        room_image_url: roomImageUrl
      }, { transaction });

      if (rt.policy) {
        await RoomPolicy.create({
          room_type_id: roomType.id,
          cancellation_policy: rt.policy.cancellation_policy,
          payment_policy: rt.policy.payment_policy,
          children_policy: rt.policy.children_policy,
          pets_policy: rt.policy.pets_policy
        }, { transaction });
      }

      for (const f of rt.facilities || []) {
        await Facility.findOrCreate({
          where: { id: f.id },
          defaults: { id: f.id, name: f.name || f.id },
          transaction
        });
        await RoomFacility.findOrCreate({
          where: { room_type_id: roomType.id, facility_id: f.id },
          defaults: { room_type_id: roomType.id, facility_id: f.id },
          transaction
        });
      }

      for (const s of rt.services || []) {
        await Service.findOrCreate({
          where: { id: s.id },
          defaults: { id: s.id, name: s.name || s.id },
          transaction
        });
        await RoomService.findOrCreate({
          where: { room_type_id: roomType.id, service_id: s.id },
          defaults: { room_type_id: roomType.id, service_id: s.id },
          transaction
        });
      }

      for (const tagName of rt.tags || []) {
        await RoomTag.create({
          room_type_id: roomType.id,
          tag_name: tagName
        }, { transaction });
      }

      for (const priceItem of rt.prices || []) {
        await RoomPrice.create({
          room_type_id: roomType.id,
          price_date: priceItem.price_date,
          price: priceItem.price
        }, { transaction });
      }
    }

    await transaction.commit();
    return { hotel_id: hotelId, status };
  } catch (error) {
    if (!transaction.finished || transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * 根据条件获取酒店详情（内部方法）
 * @param {Object} whereClause - 查询条件
 * @returns {Promise<Object>} - 酒店详情
 */
const getHotelDetailByWhere = async (whereClause) => {
  const hotel = await Hotel.findOne({
    where: whereClause,
    include: [
      { model: HotelPolicy, as: 'policy', required: false },
      {
        model: HotelFacility,
        as: 'hotelFacilities',
        required: false,
        include: [{ model: Facility, as: 'facility', required: false }]
      },
      {
        model: HotelService,
        as: 'hotelServices',
        required: false,
        include: [{ model: Service, as: 'service', required: false }]
      },
      {
        model: RoomType,
        as: 'roomTypes',
        required: false,
        include: [
          {
            model: RoomFacility,
            as: 'roomFacilities',
            required: false,
            include: [{ model: Facility, as: 'facility', required: false }]
          },
          {
            model: RoomService,
            as: 'roomServices',
            required: false,
            include: [{ model: Service, as: 'service', required: false }]
          },
          { model: RoomPrice, as: 'roomPrices', required: false },
          { model: RoomTag, as: 'roomTags', required: false },
          { model: RoomPolicy, as: 'policy', required: false }
        ]
      }
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: RoomType, as: 'roomTypes' }, 'created_at', 'ASC'],
      [{ model: RoomType, as: 'roomTypes' }, { model: RoomPrice, as: 'roomPrices' }, 'price_date', 'ASC']
    ]
  });

  if (!hotel) {
    const error = new Error('酒店不存在');
    error.httpStatus = 404;
    error.code = 4010;
    throw error;
  }

  const facilities = (hotel.hotelFacilities || [])
    .map((item) => {
      if (item.facility) {
        return { id: item.facility.id, name: item.facility.name };
      }
      if (item.facility_id) {
        return { id: item.facility_id, name: item.facility_id };
      }
      return null;
    })
    .filter(Boolean);

  const services = (hotel.hotelServices || [])
    .map((item) => {
      if (item.service) {
        return { id: item.service.id, name: item.service.name };
      }
      if (item.service_id) {
        return { id: item.service_id, name: item.service_id };
      }
      return null;
    })
    .filter(Boolean);

  const roomPrices = {};
  for (const roomType of hotel.roomTypes || []) {
    const roomFacilities = (roomType.roomFacilities || [])
      .map((item) => {
        if (item.facility) {
          return { id: item.facility.id, name: item.facility.name };
        }
        if (item.facility_id) {
          return { id: item.facility_id, name: item.facility_id };
        }
        return null;
      })
      .filter(Boolean);

    const roomServices = (roomType.roomServices || [])
      .map((item) => {
        if (item.service) {
          return { id: item.service.id, name: item.service.name };
        }
        if (item.service_id) {
          return { id: item.service_id, name: item.service_id };
        }
        return null;
      })
      .filter(Boolean);

    const roomTags = (roomType.roomTags || []).map((tag) => tag.tag_name);
    const prices = {};
    for (const priceItem of roomType.roomPrices || []) {
      prices[priceItem.price_date] = Number(priceItem.price);
    }

    const roomPolicy = roomType.policy ? {
      cancellation: roomType.policy.cancellation_policy,
      payment: roomType.policy.payment_policy,
      children: roomType.policy.children_policy,
      pets: roomType.policy.pets_policy
    } : null;

    roomPrices[roomType.room_type_name] = {
      bed_type: roomType.bed_type,
      area: roomType.area,
      description: roomType.description,
      facilities: roomFacilities,
      room_image_url: roomType.room_image_url,
      policies: roomPolicy,
      tags: roomTags,
      services: roomServices,
      prices
    };
  }

  const policies = hotel.policy ? {
    cancellation: hotel.policy.cancellation_policy,
    payment: hotel.policy.payment_policy,
    children: hotel.policy.children_policy,
    pets: hotel.policy.pets_policy
  } : null;

  return {
    hotel_id: hotel.id,
    hotel_name_cn: hotel.hotel_name_cn,
    hotel_name_en: hotel.hotel_name_en,
    star_rating: hotel.star_rating,
    description: hotel.description,
    phone: hotel.phone,
    opening_date: hotel.opening_date,
    nearby_info: hotel.nearby_info,
    facilities,
    services,
    policies,
    room_prices: roomPrices,
    main_image_url: hotel.main_image_url || [],
    tags: hotel.tags || [],
    location_info: hotel.location_info || null,
    status: hotel.status,
    created_by: hotel.created_by,
    created_at: hotel.created_at,
    updated_at: hotel.updated_at
  };
};

/**
 * 获取酒店详情服务
 * @param {string} userId - 当前用户ID
 * @param {string} hotelId - 酒店ID
 * @returns {Promise<Object>} - 酒店详情
 */
const getHotelDetailService = async (userId, hotelId) => {
  return getHotelDetailByWhere({
    id: hotelId,
    created_by: userId
  });
};

/**
 * 管理员获取酒店详情服务
 * @param {number} hotelId - 酒店ID
 * @returns {Promise<Object>} - 酒店详情
 */
const getHotelDetailByAdminService = async (hotelId) => {
  return getHotelDetailByWhere({ id: hotelId });
};

/**
 * 删除酒店服务
 * @param {number} userId - 用户ID
 * @param {number} hotelId - 酒店ID
 * @returns {Promise<void>}
 */
const deleteHotelService = async (userId, hotelId) => {
  const hotel = await Hotel.findByPk(hotelId);
  if (!hotel) {
    const error = new Error('酒店不存在');
    error.httpStatus = 404;
    error.code = 4010;
    throw error;
  }
  if (String(hotel.created_by) !== String(userId)) {
    const error = new Error('无权限删除此酒店');
    error.httpStatus = 403;
    error.code = 4011;
    throw error;
  }
  const deletableStatuses = ['draft', 'rejected'];
  if (!deletableStatuses.includes(hotel.status)) {
    const error = new Error('酒店状态不允许删除');
    error.httpStatus = 400;
    error.code = 4012;
    throw error;
  }
  await Hotel.destroy({ where: { id: hotelId } });
  return null;
};

/**
 * 获取酒店审核状态服务
 * @param {number} userId - 用户ID
 * @param {number} hotelId - 酒店ID
 * @returns {Promise<Array>} - 审核日志列表
 */
const getHotelAuditStatusService = async (userId, hotelId) => {
  const hotel = await Hotel.findByPk(hotelId);
  if (!hotel) {
    const error = new Error('酒店不存在');
    error.httpStatus = 404;
    error.code = 4010;
    throw error;
  }
  if (String(hotel.created_by) !== String(userId)) {
    const error = new Error('无权限查看此酒店审核状态');
    error.httpStatus = 403;
    error.code = 4011;
    throw error;
  }

  const logs = await AuditLog.findAll({
    where: { hotel_id: hotelId },
    include: [
      {
        model: User,
        as: 'auditor',
        include: [{ model: UserProfile, as: 'profile' }]
      }
    ],
    order: [['audited_at', 'DESC'], ['created_at', 'DESC']]
  });

  return logs;
};

module.exports = {
  createHotelService,
  updateHotelService,
  getHotelDetailService,
  getHotelDetailByAdminService,
  deleteHotelService,
  getHotelAuditStatusService
};
