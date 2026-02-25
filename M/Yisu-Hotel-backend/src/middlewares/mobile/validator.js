const { body, query, param, validationResult } = require('express-validator');

// 验证错误处理中间件
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.json({
      code: 3001,
      msg: errorMessages[0],
      data: null
    });
  }
  next();
};

// 手机号验证
const phoneValidator = body('phone')
  .isMobilePhone('zh-CN').withMessage('手机号格式不正确');

// 密码验证
const passwordValidator = body('password')
  .isLength({ min: 6, max: 16 }).withMessage('密码长度必须在6-16位之间')
  .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/).withMessage('密码必须包含字母和数字');

// 验证码验证
const codeValidator = body('code')
  .isLength({ min: 6, max: 6 }).withMessage('验证码长度必须为6位')
  .isNumeric().withMessage('验证码必须为数字');

// 酒店ID验证
const hotelIdValidator = param('id')
  .isUUID().withMessage('酒店ID格式不正确');

// 预订ID验证
const bookingIdValidator = param('id')
  .isUUID().withMessage('预订ID格式不正确');

// 登录验证
const loginValidator = [
  phoneValidator,
  passwordValidator,
  validate
];

// 注册验证
const registerValidator = [
  phoneValidator,
  codeValidator,
  passwordValidator,
  body('agreed')
    .isBoolean().withMessage('必须同意用户协议')
    .equals('true').withMessage('必须同意用户协议'),
  validate
];

// 酒店搜索验证
const hotelSearchValidator = [
  query('city')
    .optional()
    .isString().withMessage('城市必须为字符串'),
  query('check_in')
    .optional()
    .isISO8601().withMessage('入住日期格式不正确'),
  query('check_out')
    .optional()
    .isISO8601().withMessage('退房日期格式不正确'),
  query('guests')
    .optional()
    .isInt({ min: 1 }).withMessage('客人数量必须为正整数'),
  query('min_price')
    .optional()
    .isInt({ min: 0 }).withMessage('最低价格必须为非负整数'),
  query('max_price')
    .optional()
    .isInt({ min: 0 }).withMessage('最高价格必须为非负整数'),
  query('star_rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('星级评分必须在1-5之间'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('size')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  validate
];

// 创建预订验证
const createBookingValidator = [
  body('hotel_id')
    .isUUID().withMessage('酒店ID格式不正确'),
  body('room_type_id')
    .isUUID().withMessage('房型ID格式不正确'),
  body('check_in_date')
    .isISO8601().withMessage('入住日期格式不正确'),
  body('check_out_date')
    .isISO8601().withMessage('退房日期格式不正确'),
  body('contact_name')
    .isString().withMessage('联系人姓名必须为字符串')
    .isLength({ min: 1, max: 50 }).withMessage('联系人姓名长度必须在1-50之间'),
  body('contact_phone')
    .isMobilePhone('zh-CN').withMessage('联系人手机号格式不正确'),
  body('special_requests')
    .optional()
    .isString().withMessage('特殊要求必须为字符串'),
  validate
];

// 支付验证
const payValidator = [
  body('booking_id')
    .isUUID().withMessage('预订ID格式不正确'),
  body('payment_method')
    .isString().withMessage('支付方式必须为字符串')
    .isIn(['alipay', 'wechat', 'credit_card']).withMessage('支付方式不正确'),
  body('transaction_id')
    .isString().withMessage('交易ID必须为字符串'),
  validate
];

module.exports = {
  validate,
  phoneValidator,
  passwordValidator,
  codeValidator,
  hotelIdValidator,
  bookingIdValidator,
  loginValidator,
  registerValidator,
  hotelSearchValidator,
  createBookingValidator,
  payValidator
};
