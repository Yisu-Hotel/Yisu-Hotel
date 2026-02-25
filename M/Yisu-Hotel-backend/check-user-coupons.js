const dotenv = require('dotenv');
dotenv.config();

// 导入数据库模型
const { User, Coupon, UserCoupon } = require('./src/models');

// 检查用户优惠券数据
async function checkUserCoupons() {
  try {
    console.log('检查用户优惠券数据...');
    
    // 连接数据库
    await require('./src/models').sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查询所有用户优惠券
    const userCoupons = await UserCoupon.findAll({
      include: [
        {
          model: Coupon,
          as: 'coupon'
        },
        {
          model: User,
          as: 'user'
        }
      ]
    });
    
    console.log('\n用户优惠券总数:', userCoupons.length);
    
    if (userCoupons.length > 0) {
      console.log('\n用户优惠券详情:');
      userCoupons.forEach((userCoupon, index) => {
        console.log(`\n${index + 1}. 用户ID: ${userCoupon.user_id}`);
        console.log(`   优惠券ID: ${userCoupon.coupon_id}`);
        console.log(`   优惠券名称: ${userCoupon.coupon ? userCoupon.coupon.title : '未知'}`);
        console.log(`   领取时间: ${userCoupon.created_at}`);
      });
    } else {
      console.log('\n暂无用户优惠券数据');
    }
    
    // 断开数据库连接
    await require('./src/models').sequelize.close();
    console.log('\n数据库连接已关闭');
    
  } catch (error) {
    console.error('检查用户优惠券数据失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行检查
checkUserCoupons();
