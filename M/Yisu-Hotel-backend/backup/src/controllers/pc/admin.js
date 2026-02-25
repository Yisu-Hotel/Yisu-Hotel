const { getAdminHotelAuditListService, getAdminHotelDetailService, batchAuditHotelsService } = require('../../services/pc/admin');

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

const getAdminHotelAuditList = async (req, res) => {
  try {
    const { page, pageSize, status, startDate, endDate, keyword } = req.adminHotelFilter || {
      page: 1,
      pageSize: 10,
      status: null,
      startDate: null,
      endDate: null,
      keyword: null
    };

    const data = await getAdminHotelAuditListService({
      page,
      pageSize,
      status,
      startDate,
      endDate,
      keyword
    });

    return res.json({
      code: 0,
      msg: '查询成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Get admin audit list error:');
  }
};

const getAdminHotelDetail = async (req, res) => {
  try {
    const hotelId = req.hotelId || req.params.id;
    const data = await getAdminHotelDetailService(hotelId);
    return res.json({
      code: 0,
      msg: '查询成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Get admin hotel detail error:');
  }
};

const batchAuditHotels = async (req, res) => {
  try {
    const { hotelIds, status, rejectReason } = req.adminBatchAudit || {};
    const auditorId = req.user?.userId;
    const data = await batchAuditHotelsService({
      hotelIds,
      status,
      auditorId,
      rejectReason
    });

    return res.json({
      code: 0,
      msg: '审核成功',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Batch audit error:');
  }
};

module.exports = {
  getAdminHotelAuditList,
  getAdminHotelDetail,
  batchAuditHotels
};
