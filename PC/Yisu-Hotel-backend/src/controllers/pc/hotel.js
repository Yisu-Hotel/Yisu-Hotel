const { Hotel } = require('../../models');
const { createHotelService, updateHotelService, getHotelDetailService, deleteHotelService, getHotelAuditStatusService } = require('../../services/pc/hotel');
const { buildHotelListWhere, hotelListAttributes, formatHotelList, formatAuditLogs } = require('../../utils/hotel');

const handleError = (res, error, logLabel) => {
  if (error && error.code) {
    return res.status(error.httpStatus || 400).json({
      code: error.code,
      msg: error.message,
      data: null
    });
  }
  console.error(logLabel, error);
  return res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
};

/**
 * 创建酒店
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const createHotel = async (req, res) => {
  try {
    const { userId } = req.user;
    const saveAsDraft = req.body?.save_as_draft === true || req.body?.save_as_draft === 'true' || req.body?.save_as_draft === 1 || req.body?.save_as_draft === '1';
    const isDraft = req.hotelPayload?.isDraft ?? saveAsDraft;
    const payload = { ...req.hotelPayload, isDraft, save_as_draft: saveAsDraft };
    const data = await createHotelService(userId, payload);

    return res.json({
      code: 0,
      msg: data.status === 'draft' ? '草稿已保存' : '酒店信息创建成功，等待审核',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Create hotel error:');
  }
};

/**
 * 更新酒店
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const updateHotel = async (req, res) => {
  try {
    const { userId } = req.user;
    const hotelId = req.hotelId || req.params.id;
    const saveAsDraft = req.body?.save_as_draft === true || req.body?.save_as_draft === 'true' || req.body?.save_as_draft === 1 || req.body?.save_as_draft === '1';
    const isDraft = req.hotelPayload?.isDraft ?? saveAsDraft;
    const payload = { ...req.hotelPayload, isDraft, save_as_draft: saveAsDraft };
    const data = await updateHotelService(userId, hotelId, payload);

    return res.json({
      code: 0,
      msg: data.status === 'draft' ? '草稿已保存' : '酒店信息更新成功，等待审核',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Update hotel error:');
  }
};

/**
 * 获取酒店列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const getHotelList = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, keyword } = req.query;
    const { page, size } = req.pagination || { page: 1, size: 20 };

    const whereClause = buildHotelListWhere({ userId, status, keyword });

    const total = await Hotel.count({ where: whereClause });

    const hotels = await Hotel.findAll({
      where: whereClause,
      attributes: hotelListAttributes,
      order: [['created_at', 'DESC']],
      limit: size,
      offset: (page - 1) * size,
      raw: true
    });

    const list = formatHotelList(hotels);

    return res.json({
      code: 0,
      msg: '查询成功',
      data: {
        total,
        page,
        size,
        list
      }
    });
  } catch (error) {
    return handleError(res, error, 'Get hotel list error:');
  }
};

/**
 * 获取酒店详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const getHotelDetail = async (req, res) => {
  try {
    const { userId } = req.user;
    const hotelId = req.hotelId || req.params.id;
    const data = await getHotelDetailService(userId, hotelId);

    return res.json({
      code: 0,
      msg: '查询成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Get hotel detail error:');
  }
};

/**
 * 获取酒店审核状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const getHotelAuditStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const hotelId = req.hotelId || req.params.id;
    const logs = await getHotelAuditStatusService(userId, hotelId);
    const data = formatAuditLogs(logs);

    return res.json({
      code: 0,
      msg: '查询成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Get hotel audit status error:');
  }
};

/**
 * 删除酒店
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>} - 无返回值
 */
const deleteHotel = async (req, res) => {
  try {
    const { userId } = req.user;
    const hotelId = req.hotelId || req.params.id;
    await deleteHotelService(userId, hotelId);
    return res.json({
      code: 0,
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    return handleError(res, error, 'Delete hotel error:');
  }
};

module.exports = {
  createHotel,
  updateHotel,
  getHotelList,
  getHotelDetail,
  getHotelAuditStatus,
  deleteHotel
};
