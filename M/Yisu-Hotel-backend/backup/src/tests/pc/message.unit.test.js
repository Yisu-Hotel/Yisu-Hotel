const assert = require('assert');
const { sequelize, User, Message } = require('../../models');
const { getUserMessagesService } = require('../../services/pc/message');

const buildPhone = () => `139${Date.now().toString().slice(-8)}`;

const run = async () => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.create({
      phone: buildPhone(),
      password: null,
      role: 'merchant',
      nickname: '测试用户'
    }, { transaction });

    const unreadMessage = await Message.create({
      user_id: user.id,
      sender: 'admin',
      status: '未读',
      content: {
        hotel_id: '550e8400-e29b-41d4-a716-446655440001',
        hotel_name: '测试酒店',
        status: 'approved'
      }
    }, { transaction });

    const readMessage = await Message.create({
      user_id: user.id,
      sender: 'admin',
      status: '已读',
      content: {
        hotel_id: '550e8400-e29b-41d4-a716-446655440002',
        hotel_name: '测试酒店2',
        status: 'rejected',
        reject_reason: '资料不完整'
      }
    }, { transaction });

    await transaction.commit();

    const result = await getUserMessagesService({
      userId: user.id,
      page: 1,
      pageSize: 5
    });

    assert.ok(result.total >= 1);
    assert.ok(Array.isArray(result.list));
    const listIds = result.list.map((item) => item.id);
    assert.ok(listIds.includes(unreadMessage.id));
    assert.ok(listIds.includes(readMessage.id));
    const updatedUnread = result.list.find((item) => item.id === unreadMessage.id);
    assert.strictEqual(updatedUnread.status, '已读');

    await Message.destroy({ where: { id: [unreadMessage.id, readMessage.id] } });
    await User.destroy({ where: { id: user.id } });

    console.log('message service tests passed');
  } catch (error) {
    if (!transaction.finished || transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    console.error('message service tests failed:', error.message);
    process.exitCode = 1;
  }
};

run();
