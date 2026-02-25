const dotenv = require('dotenv');
dotenv.config();

// 导入优惠券服务
const { getCouponListService } = require('../../../services/mobile/coupon');

// 测试优惠券服务
async function testCouponService() {
  try {
    console.log('测试修改后的优惠券服务...');
    
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
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试优惠券服务失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testCouponService();
