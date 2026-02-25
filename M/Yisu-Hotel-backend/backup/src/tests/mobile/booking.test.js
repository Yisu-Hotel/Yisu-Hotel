const http = require('http');

// 存储有效的预订ID
let validBookingId = '';

// 测试获取预订列表
const testGetBookingList = () => {
  console.log('=== 测试获取预订列表 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/booking/list',
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Booking List Response:', JSON.stringify(response, null, 2));
      
      // 从响应中获取一个有效的预订ID
      if (response.code === 0 && response.data.bookings && response.data.bookings.length > 0) {
        validBookingId = response.data.bookings[0].id;
        console.log('获取到有效的预订ID:', validBookingId);
        
        // 使用有效的预订ID测试其他功能
        testGetBookingDetail(validBookingId);
        testCancelBooking(validBookingId);
        testPayBooking(validBookingId);
      }
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试获取预订详情
const testGetBookingDetail = (bookingId) => {
  if (!bookingId) {
    console.log('\n=== 测试获取预订详情 ===');
    console.log('没有有效的预订ID，跳过测试');
    return;
  }
  
  console.log('\n=== 测试获取预订详情 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: `/mobile/booking/detail/${bookingId}`,
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Get Booking Detail Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试创建预订
const testCreateBooking = () => {
  console.log('\n=== 测试创建预订 ===');
  const postData = JSON.stringify({
    hotel_id: '80f9edf1-9a7a-4f29-8d43-8735ad83fa16',
    room_type_id: '363f3583-7ad0-48d5-a09b-ece9cdd52796',
    check_in_date: '2026-02-15',
    check_out_date: '2026-02-16',
    contact_name: '张三',
    contact_phone: '18595890987',
    special_requests: ''
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/booking',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Create Booking Response:', JSON.stringify(response, null, 2));
      
      // 如果创建预订成功，使用新创建的预订ID测试其他功能
      if (response.code === 0 && response.data && response.data.booking_id) {
        validBookingId = response.data.booking_id;
        console.log('创建预订成功，获取到新的预订ID:', validBookingId);
      }
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 测试取消预订
const testCancelBooking = (bookingId) => {
  if (!bookingId) {
    console.log('\n=== 测试取消预订 ===');
    console.log('没有有效的预订ID，跳过测试');
    return;
  }
  
  console.log('\n=== 测试取消预订 ===');
  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: `/mobile/booking/cancel/${bookingId}`,
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Cancel Booking Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.end();
};

// 测试支付预订
const testPayBooking = (bookingId) => {
  if (!bookingId) {
    console.log('\n=== 测试支付预订 ===');
    console.log('没有有效的预订ID，跳过测试');
    return;
  }
  
  console.log('\n=== 测试支付预订 ===');
  const postData = JSON.stringify({
    booking_id: bookingId,
    payment_method: 'wechat',
    transaction_id: `TXN_${Date.now()}`
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5050,
    path: '/mobile/booking/pay',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQxN2NkM2EtNGVjOS00Zjk0LTgzYzctYjIxNGU5ZGQ3NmRhIiwicGhvbmUiOiIxODU5NTg5MDk4NyIsInJvbGUiOiJtb2JpbGUiLCJpYXQiOjE3NzA5NjQ5NzEsImV4cCI6MTc3MDk3MjE3MX0.LsWP3iuIH9cvREbdKftDRX2R-D3JYiIJA1SGxKgtxvg'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('Pay Booking Response:', JSON.stringify(response, null, 2));
    });
  });

  req.on('error', (error) => console.error('请求失败:', error.message));
  req.write(postData);
  req.end();
};

// 执行测试
testGetBookingList();
testCreateBooking();
