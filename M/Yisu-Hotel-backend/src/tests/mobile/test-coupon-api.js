const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');

// 测试优惠券API
async function testCouponAPI() {
  try {
    // 优惠券API端点（使用正确的端口）
    const couponListUrl = 'http://localhost:3001/mobile/coupon/list';
    
    // 测试用户token（从实际登录获取）
    const testToken = 'your_test_token_here';
    
    console.log('测试优惠券列表API...');
    console.log('API端点:', couponListUrl);
    
    // 发送请求获取优惠券列表
    const response = await axios.get(couponListUrl, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('优惠券API响应状态:', response.status);
    console.log('优惠券API响应数据:', JSON.stringify(response.data, null, 2));
    
    // 检查是否返回了优惠券数据
    if (response.data && response.data.coupons && response.data.coupons.length > 0) {
      console.log('✓ 成功获取到优惠券数据');
      console.log('优惠券数量:', response.data.coupons.length);
    } else {
      console.log('⚠ 未获取到优惠券数据');
    }
    
  } catch (error) {
    console.error('测试优惠券API失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但未收到响应:', error.request);
    }
  }
}

// 测试未登录状态下的优惠券API（可选）
async function testCouponAPIWithoutAuth() {
  try {
    // 优惠券API端点（使用正确的端口）
    const couponListUrl = 'http://localhost:3001/mobile/coupon/list';
    
    console.log('\n测试未登录状态下的优惠券列表API...');
    console.log('API端点:', couponListUrl);
    
    // 发送请求获取优惠券列表（无认证）
    const response = await axios.get(couponListUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('优惠券API响应状态:', response.status);
    console.log('优惠券API响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('测试未登录状态下的优惠券API失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但未收到响应:', error.request);
    }
  }
}

// 运行测试
testCouponAPI();
testCouponAPIWithoutAuth();
