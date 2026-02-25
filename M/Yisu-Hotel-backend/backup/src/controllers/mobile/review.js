const { getHotelReviewsService, submitHotelReviewService, getUserReviewsService } = require('../../services/mobile/review');

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

const reviewController = {
  // 获取酒店评价列表
  getHotelReviews: async (req, res) => {
    try {
      const { hotel_id } = req.params;
      const data = await getHotelReviewsService(hotel_id, req.query);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get hotel reviews error:');
    }
  },

  // 提交酒店评价
  submitHotelReview: async (req, res) => {
    try {
      const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
      const data = await submitHotelReviewService(user_id, req.body);
      return res.json({ code: 0, msg: '评价提交成功', data });
    } catch (error) {
      return handleError(res, error, 'Submit hotel review error:');
    }
  },

  // 获取用户评价列表
  getUserReviews: async (req, res) => {
    try {
      const { user_id } = req.user || { user_id: 'test_user' }; // 临时添加测试用户ID
      const data = await getUserReviewsService(user_id, req.query);
      return res.json({ code: 0, msg: '获取成功', data });
    } catch (error) {
      return handleError(res, error, 'Get user reviews error:');
    }
  }
};

module.exports = reviewController;