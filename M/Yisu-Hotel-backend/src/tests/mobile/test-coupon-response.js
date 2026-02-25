const dotenv = require('dotenv');
dotenv.config();

// 导入优惠券服务
const { getCouponListService } = require('./src/services/mobile/coupon');

// 测试优惠券服务响应
async function testCouponResponse() {
  try {
    console.log('测试优惠券服务响应...');
    
    // 测试场景: 使用测试用户ID
    console.log('\n测试场景: 使用测试用户ID');
    const testUserId = 'test_user';
    const result = await getCouponListService(testUserId, 'all');
    
    console.log('\n优惠券服务响应结构:');
    console.log('coupons数组长度:', result.coupons.length);
    console.log('pushCoupons.limited数组长度:', result.pushCoupons.limited.length);
    console.log('pushCoupons.selected数组长度:', result.pushCoupons.selected.length);
    
    if (result.coupons.length > 0) {
      console.log('\ncoupons数组包含数据，这可能是导致前端显示优惠券的原因');
      console.log('前3个优惠券:');
      result.coupons.slice(0, 3).forEach((coupon, index) => {
        console.log(`${index + 1}. ${coupon.title} - 状态: ${coupon.status}`);
      });
    }
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试优惠券服务响应失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testCouponResponse();
