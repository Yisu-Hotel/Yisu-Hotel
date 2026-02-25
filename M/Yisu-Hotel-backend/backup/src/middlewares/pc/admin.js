const { isNonEmptyString, isValidDateYYYYMMDD, isValidUuid } = require('../../utils/validator');

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      code: 4019,
      msg: '无权限访问此接口',
      data: null
    });
  }
  next();
};

const validateAdminHotelAuditListQuery = (req, res, next) => {
  const { page, page_size, status, start_date, end_date, keyword } = req.query;

  let pageNumber = 1;
  let pageSizeNumber = 10;

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

  if (page_size !== undefined) {
    pageSizeNumber = Number(page_size);
    if (!Number.isFinite(pageSizeNumber) || pageSizeNumber < 1 || !Number.isInteger(pageSizeNumber)) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  if (pageSizeNumber > 100) {
    pageSizeNumber = 100;
  }

  let statusValue = null;
  if (status !== undefined) {
    statusValue = isNonEmptyString(status) ? String(status).trim() : '';
    if (!statusValue || !['pending', 'auditing', 'approved', 'rejected'].includes(statusValue)) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  let startDateValue = null;
  if (start_date !== undefined) {
    startDateValue = isNonEmptyString(start_date) ? String(start_date).trim() : '';
    if (!startDateValue || !isValidDateYYYYMMDD(startDateValue)) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  let endDateValue = null;
  if (end_date !== undefined) {
    endDateValue = isNonEmptyString(end_date) ? String(end_date).trim() : '';
    if (!endDateValue || !isValidDateYYYYMMDD(endDateValue)) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  if (startDateValue && endDateValue) {
    const startDate = new Date(`${startDateValue}T00:00:00Z`);
    const endDate = new Date(`${endDateValue}T00:00:00Z`);
    if (startDate.getTime() > endDate.getTime()) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  let keywordValue = null;
  if (keyword !== undefined) {
    keywordValue = isNonEmptyString(keyword) ? String(keyword).trim() : '';
    if (!keywordValue) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  req.adminHotelFilter = {
    page: pageNumber,
    pageSize: pageSizeNumber,
    status: statusValue || null,
    startDate: startDateValue || null,
    endDate: endDateValue || null,
    keyword: keywordValue || null
  };

  next();
};

const validateAdminBatchAudit = (req, res, next) => {
  const { hotel_ids, status, reject_reason } = req.body || {};

  if (!Array.isArray(hotel_ids) || hotel_ids.length === 0) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  const uniqueIds = Array.from(new Set(hotel_ids.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)));
  if (uniqueIds.length === 0 || uniqueIds.some((id) => !isValidUuid(id))) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  const statusValue = isNonEmptyString(status) ? String(status).trim() : '';
  if (!['approved', 'rejected'].includes(statusValue)) {
    return res.status(400).json({
      code: 4009,
      msg: '参数格式不正确',
      data: null
    });
  }

  let rejectReasonValue = null;
  if (statusValue === 'rejected') {
    rejectReasonValue = isNonEmptyString(reject_reason) ? String(reject_reason).trim() : '';
    if (!rejectReasonValue) {
      return res.status(400).json({
        code: 4009,
        msg: '参数格式不正确',
        data: null
      });
    }
  }

  req.adminBatchAudit = {
    hotelIds: uniqueIds,
    status: statusValue,
    rejectReason: rejectReasonValue || null
  };

  next();
};

module.exports = {
  requireAdmin,
  validateAdminHotelAuditListQuery,
  validateAdminBatchAudit
};
