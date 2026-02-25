const dotenv = require('dotenv');
dotenv.config();

// 导入数据库模型
const { UserCoupon } = require('./src/models');

// 删除所有可用的用户优惠券
async function deleteAllAvailableCoupons() {
  try {
    console.log('删除所有可用的用户优惠券...');
    
    // 连接数据库
    await require('./src/models').sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查询所有状态为unused的用户优惠券（即可用状态）
    const availableUserCoupons = await UserCoupon.findAll({
      where: {
        status: 'unused'
      }
    });
    
    console.log(`\n可用优惠券数量: ${availableUserCoupons.length}`);
    
    if (availableUserCoupons.length > 0) {
      console.log('\n开始删除可用优惠券...');
      
      // 删除所有可用优惠券
      let deletedCount = 0;
      for (const userCoupon of availableUserCoupons) {
        await userCoupon.destroy();
        deletedCount++;
        console.log(`删除优惠券ID: ${userCoupon.id}, 用户ID: ${userCoupon.user_id}`);
      }
      
      console.log(`\n删除完成！共删除 ${deletedCount} 个可用优惠券`);
    } else {
      console.log('\n暂无可用优惠券需要删除');
    }
    
    // 断开数据库连接
    await require('./src/models').sequelize.close();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('删除可用优惠券失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行删除操作
deleteAllAvailableCoupons();
