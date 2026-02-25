const dotenv = require('dotenv');
dotenv.config();

// 导入优惠券服务
const { getCouponListService } = require('../../../services/mobile/coupon');

// 测试优惠券服务
async function testCouponService() {
  try {
    console.log('测试优惠券服务...');
    
    // 测试场景1: 使用有效的UUID用户ID
    console.log('\n测试场景1: 使用有效的UUID用户ID');
    const validUserId = '5417cd3a-4ec9-4f94-83c7-b214e9dd76da';
    const result1 = await getCouponListService(validUserId, 'all');
    console.log('优惠券服务响应:', JSON.stringify(result1, null, 2));
    
    if (result1 && result1.coupons && result1.coupons.length > 0) {
      console.log('✓ 成功获取到优惠券数据');
      console.log('优惠券数量:', result1.coupons.length);
    } else {
      console.log('⚠ 未获取到优惠券数据');
    }
    
    // 测试场景2: 使用非UUID格式的用户ID（如手机号）
    console.log('\n测试场景2: 使用非UUID格式的用户ID（如手机号）');
    const phoneUserId = '18595890987';
    const result2 = await getCouponListService(phoneUserId, 'all');
    console.log('优惠券服务响应:', JSON.stringify(result2, null, 2));
    
    if (result2 && result2.coupons && result2.coupons.length > 0) {
      console.log('✓ 成功获取到优惠券数据');
      console.log('优惠券数量:', result2.coupons.length);
    } else {
      console.log('⚠ 未获取到优惠券数据');
    }
    
    // 测试场景3: 使用测试用户ID
    console.log('\n测试场景3: 使用测试用户ID');
    const testUserId = 'test_user';
    const result3 = await getCouponListService(testUserId, 'all');
    console.log('优惠券服务响应:', JSON.stringify(result3, null, 2));
    
    if (result3 && result3.coupons && result3.coupons.length > 0) {
      console.log('✓ 成功获取到优惠券数据');
      console.log('优惠券数量:', result3.coupons.length);
    } else {
      console.log('⚠ 未获取到优惠券数据');
    }
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试优惠券服务失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testCouponService();
