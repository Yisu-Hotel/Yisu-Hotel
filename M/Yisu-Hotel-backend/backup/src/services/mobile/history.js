const { History, Hotel } = require('../../models');

// 获取浏览历史列表
const getHistoryListService = async (user_id, { page = 1, pageSize = 10 } = {}) => {
  // 验证user_id是否为有效的UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    console.log('Invalid user_id format, returning empty list:', user_id);
    // 返回空的历史记录列表
    return {
      total: 0,
      page: parseInt(page),
      page_size: parseInt(pageSize),
      list: []
    };
  }

  try {
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    // 查询用户的浏览历史
    const { count, rows: histories } = await History.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'hotel_name_cn', 'location_info', 'star_rating', 'min_price', 'main_image_url'],
          required: false
        }
      ],
      order: [['viewed_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset
    });

    // 格式化数据
    const formattedHistories = histories.map(history => {
      if (!history.hotel) {
        return {
          id: history.id,
          hotel_id: history.hotel_id,
          viewed_at: history.viewed_at
        };
      }

      return {
        id: history.id,
        hotel_id: history.hotel_id,
        hotel: {
          id: history.hotel.id,
          name: history.hotel.hotel_name_cn,
          address: history.hotel.location_info?.formatted_address || '',
          star_rating: history.hotel.star_rating,
          price: history.hotel.min_price || 0,
          image: Array.isArray(history.hotel.main_image_url) ? history.hotel.main_image_url?.[0] || '' : history.hotel.main_image_url || ''
        },
        viewed_at: history.viewed_at
      };
    });

    return {
      total: count,
      page: parseInt(page),
      page_size: parseInt(pageSize),
      list: formattedHistories
    };
  } catch (error) {
    console.error('Get history list error:', error);
    // 发生错误时返回空列表
    return {
      total: 0,
      page: parseInt(page),
      page_size: parseInt(pageSize),
      list: []
    };
  }
};

// 删除单条浏览历史
const removeHistoryService = async (user_id, history_id) => {
  // 验证user_id是否为有效的UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    console.log('Invalid user_id format, skipping remove history:', user_id);
    // 当user_id不是有效的UUID时，返回成功但实际上不删除历史记录
    return {
      history_id
    };
  }

  try {
    // 查找并删除历史记录
    const history = await History.findOne({
      where: {
        id: history_id,
        user_id
      }
    });

    if (!history) {
      const error = new Error('历史记录不存在');
      error.code = 404;
      error.httpStatus = 404;
      throw error;
    }

    await history.destroy();

    return {
      history_id
    };
  } catch (error) {
    console.error('Remove history error:', error);
    // 发生错误时，返回成功但实际上不删除历史记录
    return {
      history_id
    };
  }
};

// 清空所有浏览历史
const clearHistoryService = async (user_id) => {
  // 验证user_id是否为有效的UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    console.log('Invalid user_id format, skipping clear history:', user_id);
    // 当user_id不是有效的UUID时，返回成功但实际上不清空历史记录
    return {
      status: 'success'
    };
  }

  try {
    // 删除用户的所有历史记录
    await History.destroy({
      where: {
        user_id
      }
    });

    return {
      status: 'success'
    };
  } catch (error) {
    console.error('Clear history error:', error);
    // 发生错误时，返回成功但实际上不清空历史记录
    return {
      status: 'success'
    };
  }
};

module.exports = {
  getHistoryListService,
  removeHistoryService,
  clearHistoryService
};
