const dotenv = require('dotenv');
dotenv.config();

// 导入数据库模型
const { UserCoupon } = require('./src/models');

// 减少用户优惠券数据
async function reduceUserCoupons() {
  try {
    console.log('减少用户优惠券数据...');
    
    // 连接数据库
    await require('./src/models').sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 目标用户ID (从检查结果看，这个用户有最多的优惠券)
    const targetUserId = '5417cd3a-4ec9-4f94-83c7-b214e9dd76da';
    
    // 查询该用户的所有优惠券，按创建时间排序
    const userCoupons = await UserCoupon.findAll({
      where: {
        user_id: targetUserId
      },
      order: [['created_at', 'ASC']]
    });
    
    console.log(`\n目标用户ID: ${targetUserId}`);
    console.log(`当前优惠券数量: ${userCoupons.length}`);
    
    if (userCoupons.length > 5) {
      // 保留前5个优惠券，删除后面的
      const couponsToDelete = userCoupons.slice(5);
      console.log(`\n删除 ${couponsToDelete.length} 个优惠券`);
      
      // 删除优惠券
      for (const couponToDelete of couponsToDelete) {
        await couponToDelete.destroy();
        console.log(`删除优惠券ID: ${couponToDelete.id}`);
      }
      
      console.log('\n删除完成！');
    } else {
      console.log('\n优惠券数量已经不多，不需要删除');
    }
    
    // 再次查询该用户的优惠券数量
    const updatedUserCoupons = await UserCoupon.findAll({
      where: {
        user_id: targetUserId
      }
    });
    
    console.log(`\n更新后优惠券数量: ${updatedUserCoupons.length}`);
    
    // 断开数据库连接
    await require('./src/models').sequelize.close();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('减少用户优惠券数据失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行减少用户优惠券数据
reduceUserCoupons();
