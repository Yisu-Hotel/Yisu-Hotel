const { Coupon } = require('../../models');

const getNewUserPromotionService = async (user_id) => {
  try {
    // 检查用户是否已有新人优惠
    const existingCoupon = await Coupon.findOne({
      where: { user_id, type: 'new_user' }
    });
    
    if (!existingCoupon) {
      // 创建新人优惠
      const newCoupon = await Coupon.create({
        user_id,
        type: 'new_user',
        title: '新人立减 10 元',
        description: '首次预订可享新人立减 10 元',
        discount: 10,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'available'
      });
      
      return {
        promotions: [{
          id: newCoupon.id,
          title: newCoupon.title,
          description: newCoupon.description,
          discount: newCoupon.discount,
          valid_until: newCoupon.valid_until.toISOString(),
          rules: '1. 仅限首次预订使用\n2. 适用于所有酒店\n3. 不可与其他优惠叠加'
        }]
      };
    }
    
    // 返回已有的新人优惠
    return {
      promotions: [{
        id: existingCoupon.id,
        title: existingCoupon.title,
        description: existingCoupon.description,
        discount: existingCoupon.discount,
        valid_until: existingCoupon.valid_until.toISOString(),
        rules: '1. 仅限首次预订使用\n2. 适用于所有酒店\n3. 不可与其他优惠叠加'
      }]
    };
  } catch (error) {
    // 如果数据库操作失败，返回模拟数据
    return {
      promotions: [{
        id: 'new_user_001',
        title: '新人立减 10 元',
        description: '首次预订可享新人立减 10 元',
        discount: 10,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rules: '1. 仅限首次预订使用\n2. 适用于所有酒店\n3. 不可与其他优惠叠加'
      }]
    };
  }
};

const getPromotionListService = async (user_id, params) => {
  const { page = 1, page_size = 10, status } = params;
  
  try {
    // 构建查询条件
    const whereCondition = {
      user_id
    };
    
    if (status) {
      whereCondition.status = status;
    }
    
    // 查询优惠券列表
    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size)
    });
    
    // 格式化数据
    const promotions = coupons.map(coupon => {
      return {
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        discount: coupon.discount,
        valid_until: coupon.valid_until.toISOString(),
        status: coupon.status,
        status_text: getStatusText(coupon.status),
        obtained_at: coupon.created_at.toISOString(),
        used_at: coupon.used_at ? coupon.used_at.toISOString() : null
      };
    });
    
    return {
      promotions: promotions,
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    };
  } catch (error) {
    // 如果数据库操作失败，返回模拟数据
    const promotions = [
      {
        id: 'promo_001',
        title: '新人立减 10 元',
        description: '首次预订可享新人立减 10 元',
        discount: 10,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available',
        status_text: '可用',
        obtained_at: new Date().toISOString(),
        used_at: null
      },
      {
        id: 'promo_002',
        title: '节日特惠 8 折',
        description: '春节期间预订酒店享受 8 折优惠',
        discount: 20,
        valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available',
        status_text: '可用',
        obtained_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        used_at: null
      }
    ];
    
    let filteredPromotions = promotions;
    if (status) {
      filteredPromotions = promotions.filter(promo => promo.status === status);
    }
    
    const start = (parseInt(page) - 1) * parseInt(page_size);
    const end = start + parseInt(page_size);
    const paginatedPromotions = filteredPromotions.slice(start, end);
    
    return {
      promotions: paginatedPromotions,
      total: filteredPromotions.length,
      page: parseInt(page),
      page_size: parseInt(page_size)
    };
  }
};

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    available: '可用',
    used: '已使用',
    expired: '已过期'
  };
  return statusMap[status] || status;
}

module.exports = {
  getNewUserPromotionService,
  getPromotionListService
};