const dotenv = require('dotenv');
dotenv.config();

// 导入优惠券服务
const { getCouponListService } = require('./src/services/mobile/coupon');

// 测试推荐优惠券服务
async function testRecommendedCoupons() {
  try {
    console.log('测试推荐优惠券服务...');
    
    // 测试场景: 使用测试用户ID
    console.log('\n测试场景: 使用测试用户ID');
    const testUserId = 'test_user';
    const result = await getCouponListService(testUserId, 'all');
    
    console.log('优惠券服务响应:', JSON.stringify(result, null, 2));
    
    // 检查是否返回了pushCoupons字段
    if (result && result.pushCoupons) {
      console.log('\n✓ 成功返回了pushCoupons字段');
      console.log('限时抢优惠券数量:', result.pushCoupons.limited.length);
      console.log('银行优惠优惠券数量:', result.pushCoupons.bank.length);
      console.log('领好券优惠券数量:', result.pushCoupons.selected.length);
    } else {
      console.log('\n⚠ 未返回pushCoupons字段');
    }
    
    // 检查是否返回了coupons字段
    if (result && result.coupons && result.coupons.length > 0) {
      console.log('\n✓ 成功返回了coupons字段');
      console.log('优惠券数量:', result.coupons.length);
    } else {
      console.log('\n⚠ 未返回coupons字段或优惠券数量为0');
    }
    
    // 检查推荐优惠券数据
    if (result && result.pushCoupons) {
      console.log('\n推荐优惠券数据详情:');
      
      // 检查限时抢优惠券
      if (result.pushCoupons.limited && result.pushCoupons.limited.length > 0) {
        console.log('\n限时抢优惠券:');
        result.pushCoupons.limited.forEach((coupon, index) => {
          console.log(`${index + 1}. ${coupon.name} - ${coupon.value}元`);
          console.log(`   描述: ${coupon.description}`);
          console.log(`   使用条件: ${coupon.limit}`);
          console.log(`   有效期: ${coupon.expire_date}`);
        });
      }
      
      // 检查领好券优惠券
      if (result.pushCoupons.selected && result.pushCoupons.selected.length > 0) {
        console.log('\n领好券优惠券:');
        result.pushCoupons.selected.forEach((coupon, index) => {
          console.log(`${index + 1}. ${coupon.name} - ${coupon.value}元`);
          console.log(`   描述: ${coupon.description}`);
          console.log(`   使用条件: ${coupon.limit}`);
          console.log(`   有效期: ${coupon.expire_date}`);
        });
      }
    }
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试推荐优惠券服务失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testRecommendedCoupons();
