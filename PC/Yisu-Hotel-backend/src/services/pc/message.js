const { sequelize, Message } = require('../../models');

/**
 * 获取用户消息列表服务
 * @param {Object} params - 查询参数
 * @param {number} params.userId - 用户ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<Object>} - 消息列表
 */
const getUserMessagesService = async ({ userId, page, pageSize }) => {
  const whereClause = { user_id: userId };

  const total = await Message.count({ where: whereClause });
  const list = await Message.findAll({
    where: whereClause,
    order: [
      [sequelize.literal(`CASE WHEN status = '未读' THEN 0 ELSE 1 END`), 'ASC'],
      ['created_at', 'DESC']
    ],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    raw: true
  });

  const unreadIds = list.filter((item) => item.status === '未读').map((item) => item.id);
  if (unreadIds.length) {
    await Message.update({ status: '已读' }, { where: { id: unreadIds } });
    list.forEach((item) => {
      if (unreadIds.includes(item.id)) {
        item.status = '已读';
      }
    });
  }

  return {
    total,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
    list
  };
};

module.exports = {
  getUserMessagesService
};
