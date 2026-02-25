const http = require('http');

let validBookingId = '';
let authToken = '';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

const requestJson = (options, body) => new Promise((resolve, reject) => {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        resolve({
          code: -1,
          msg: 'Invalid JSON response',
          data: {
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            body: data
          }
        });
      }
    });
  });
  req.on('error', reject);
  if (body) {
    req.write(JSON.stringify(body));
  }
  req.end();
});

const formatDate = (date) => date.toISOString().split('T')[0];

const loginAndRun = async () => {
  try {
    const response = await requestJson({
      hostname,
      port,
      path: '/mobile/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      phone: '15928077855',
      password: 'xby123456'
    });
    console.log('Login Response:', JSON.stringify(response, null, 2));
    if (response.code === 0 && response.data && response.data.token) {
      authToken = response.data.token;
      // 使用 await 确保顺序执行
      await testGetBookingList();
      await testCreateBooking();
      
      // 对新创建的订单进行支付和取消测试
      if (validBookingId) {
        console.log('对新订单进行支付和取消测试:', validBookingId);
        await testPayBooking(validBookingId);
        await testCancelBooking(validBookingId);
      }
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

const testGetBookingList = async () => {
  console.log('=== 测试获取预订列表 ===');
  try {
    const response = await requestJson({
      hostname,
      port,
      path: '/mobile/booking/list',
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Get Booking List Response:', JSON.stringify(response, null, 2));
    if (response.code === 0 && response.data.bookings && response.data.bookings.length > 0) {
      validBookingId = response.data.bookings[0].id;
      console.log('获取到有效的预订ID:', validBookingId);
      
      // 按顺序执行后续测试
      await testGetBookingDetail(validBookingId);
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

const testGetBookingDetail = async (bookingId) => {
  if (!bookingId) {
    console.log('\n=== 测试获取预订详情 ===');
    console.log('没有有效的预订ID，跳过测试');
    return;
  }
  
  console.log('\n=== 测试获取预订详情 ===');
  try {
    const response = await requestJson({
      hostname,
      port,
      path: `/mobile/booking/detail/${bookingId}`,
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Get Booking Detail Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

const testCreateBooking = async () => {
  console.log('\n=== 测试创建预订 ===');
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 2);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 1);
  
  try {
    const response = await requestJson({
      hostname,
      port,
      path: '/mobile/booking',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      hotel_id: '80f9edf1-9a7a-4f29-8d43-8735ad83fa16',
      room_type_id: '363f3583-7ad0-48d5-a09b-ece9cdd52796',
      check_in_date: formatDate(checkInDate),
      check_out_date: formatDate(checkOutDate),
      contact_name: '张三',
      contact_phone: '18595890987',
      special_requests: ''
    });
    
    console.log('Create Booking Response:', JSON.stringify(response, null, 2));
    if (response.code === 0 && response.data && response.data.booking_id) {
      validBookingId = response.data.booking_id;
      console.log('创建预订成功，获取到新的预订ID:', validBookingId);
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

const testCancelBooking = async (bookingId) => {
  if (!bookingId) {
    console.log('\n=== 测试取消预订 ===');
    console.log('没有有效的预订ID，跳过测试');
    return;
  }
  
  console.log('\n=== 测试取消预订 ===');
  try {
    const response = await requestJson({
      hostname,
      port,
      path: '/mobile/booking/cancel',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      order_id: bookingId
    });
    console.log('Cancel Booking Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

const testPayBooking = async (bookingId) => {
  if (!bookingId) {
    console.log('\n=== 测试支付预订 ===');
    console.log('没有有效的预订ID，跳过测试');
    return;
  }
  
  console.log('\n=== 测试支付预订 ===');
  try {
    const response = await requestJson({
      hostname,
      port,
      path: '/mobile/booking/pay',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      booking_id: bookingId,
      order_id: bookingId,
      payment_method: 'wechat',
      transaction_id: `TXN_${Date.now()}`
    });
    console.log('Pay Booking Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

loginAndRun();
